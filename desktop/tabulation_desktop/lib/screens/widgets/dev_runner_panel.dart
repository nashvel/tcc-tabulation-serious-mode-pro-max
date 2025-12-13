import 'package:flutter/material.dart';
import 'dart:io';
import 'dart:convert';
import '../../theme/app_theme.dart';

class DevRunnerPanel extends StatefulWidget {
  const DevRunnerPanel({super.key});

  @override
  DevRunnerPanelState createState() => DevRunnerPanelState();
}

class DevRunnerPanelState extends State<DevRunnerPanel> {
  String? backendPath;
  String? frontendPath;
  String backendCommand = 'php artisan serve';
  String reverbCommand = 'php artisan reverb:start';
  String frontendCommand = 'npm run dev';
  
  Process? backendProcess;
  Process? reverbProcess;
  Process? frontendProcess;
  bool backendRunning = false;
  bool reverbRunning = false;
  bool frontendRunning = false;
  
  // Loading states for better UX
  bool backendLoading = false;
  bool reverbLoading = false;
  bool frontendLoading = false;
  
  // Active ports tracking
  Map<String, List<int>> activePorts = {
    'Backend': [],
    'Reverb': [],
    'Frontend': [],
  };
  
  // LAN mode and network info
  bool lanMode = false;
  String? localIp;
  List<String> connectedDevices = [];
  bool scanningDevices = false;

  @override
  void initState() {
    super.initState();
    _loadPaths();
    _loadCommands();
    _loadLanMode();
    _checkRunningServers();
    _getLocalIp();
  }
  
  Future<void> _loadLanMode() async {
    try {
      final configFile = File('${Directory.current.path}/database.json');
      if (await configFile.exists()) {
        final content = await configFile.readAsString();
        final json = jsonDecode(content);
        setState(() {
          lanMode = json['lanMode'] ?? false;
        });
      }
    } catch (e) {
      debugPrint('Error loading LAN mode: $e');
    }
  }
  
  Future<void> _saveLanMode() async {
    try {
      final configFile = File('${Directory.current.path}/database.json');
      Map<String, dynamic> json = {};
      if (await configFile.exists()) {
        final content = await configFile.readAsString();
        json = jsonDecode(content);
      }
      json['lanMode'] = lanMode;
      await configFile.writeAsString(jsonEncode(json));
    } catch (e) {
      debugPrint('Error saving LAN mode: $e');
    }
  }
  
  Future<void> _getLocalIp() async {
    try {
      // Use Dart's NetworkInterface API - more reliable than PowerShell
      final interfaces = await NetworkInterface.list(
        type: InternetAddressType.IPv4,
        includeLoopback: false,
      );
      for (var interface in interfaces) {
        for (var addr in interface.addresses) {
          final ip = addr.address;
          // Skip loopback and link-local addresses
          if (!ip.startsWith('127.') && !ip.startsWith('169.254.')) {
            if (mounted) setState(() => localIp = ip);
            return;
          }
        }
      }
    } catch (e) {
      debugPrint('Error getting local IP: $e');
    }
  }
  
  Future<void> _scanConnectedDevices() async {
    if (!Platform.isWindows || localIp == null || scanningDevices) return;
    
    setState(() => scanningDevices = true);
    
    try {
      // Get ARP table to find connected devices
      final result = await Process.run('arp', ['-a']);
      final lines = result.stdout.toString().split('\n');
      final devices = <String>[];
      for (var line in lines) {
        final match = RegExp(r'(\d+\.\d+\.\d+\.\d+)').firstMatch(line);
        if (match != null) {
          final ip = match.group(1)!;
          // Filter out:
          // - Broadcast addresses (255.x.x.x, x.x.x.255)
          // - Own IP
          // - Multicast addresses (224.x.x.x - 239.x.x.x)
          // - Gateway/router (typically .1)
          // - Link-local (169.254.x.x)
          if (!ip.startsWith('255.') && 
              !ip.endsWith('.255') && 
              !ip.endsWith('.1') &&
              ip != localIp && 
              !ip.startsWith('224.') &&
              !ip.startsWith('239.') &&
              !ip.startsWith('169.254.')) {
            devices.add(ip);
          }
        }
      }
      if (mounted) setState(() => connectedDevices = devices);
    } catch (_) {}
    
    if (mounted) setState(() => scanningDevices = false);
  }
  
  /// Check if servers are already running by checking their ports
  Future<void> _checkRunningServers() async {
    if (!Platform.isWindows) return;
    
    // Check Backend (port 8000)
    final backendCheck = await _isPortInUse(8000);
    // Check Reverb (port 8080)
    final reverbCheck = await _isPortInUse(8080);
    // Check Frontend (ports 5173-5176)
    List<int> frontendActivePorts = [];
    for (int port in [5173, 5174, 5175, 5176]) {
      if (await _isPortInUse(port)) frontendActivePorts.add(port);
    }
    
    if (mounted) {
      setState(() {
        backendRunning = backendCheck;
        reverbRunning = reverbCheck;
        frontendRunning = frontendActivePorts.isNotEmpty;
        activePorts = {
          'Backend': backendCheck ? [8000] : [],
          'Reverb': reverbCheck ? [8080] : [],
          'Frontend': frontendActivePorts,
        };
      });
    }
  }
  
  /// Check if a specific port is in use
  Future<bool> _isPortInUse(int port) async {
    try {
      final result = await Process.run('powershell', [
        '-Command',
        'Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1'
      ]);
      return result.stdout.toString().trim().isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  @override
  void dispose() {
    backendProcess?.kill();
    reverbProcess?.kill();
    frontendProcess?.kill();
    super.dispose();
  }

  Future<void> _loadPaths() async {
    try {
      final configFile = File('${Directory.current.path}/server_paths.json');
      if (await configFile.exists()) {
        final content = await configFile.readAsString();
        final json = jsonDecode(content);
        setState(() {
          backendPath = json['backendPath'];
          frontendPath = json['frontendPath'];
        });
      }
    } catch (e) {
      debugPrint('Error loading paths: $e');
    }
  }

  Future<void> _loadCommands() async {
    try {
      final configFile = File('${Directory.current.path}/database.json');
      if (await configFile.exists()) {
        final content = await configFile.readAsString();
        final json = jsonDecode(content);
        setState(() {
          backendCommand = json['backendCommand'] ?? 'php artisan serve';
          reverbCommand = json['reverbCommand'] ?? 'php artisan reverb:start';
          frontendCommand = json['frontendCommand'] ?? 'npm run dev';
        });
      }
    } catch (e) {
      debugPrint('Error loading commands: $e');
    }
  }

  Future<void> _savePaths() async {
    try {
      final configFile = File('${Directory.current.path}/server_paths.json');
      await configFile.writeAsString(jsonEncode({
        'backendPath': backendPath,
        'frontendPath': frontendPath,
      }));
    } catch (e) {
      debugPrint('Error saving paths: $e');
    }
  }

  Future<void> _saveCommands() async {
    try {
      final configFile = File('${Directory.current.path}/database.json');
      await configFile.writeAsString(jsonEncode({
        'backendCommand': backendCommand,
        'reverbCommand': reverbCommand,
        'frontendCommand': frontendCommand,
      }));
    } catch (e) {
      debugPrint('Error saving commands: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildTableHeader(),
          Container(height: 1, color: AppColors.border),
          _buildServerRow('Backend', backendPath ?? 'No folder', backendRunning, backendPath != null, backendLoading,
              () => backendRunning ? _stopBackend() : _startBackend(), () => _showServerMenu('backend')),
          Container(height: 1, color: AppColors.border),
          _buildServerRow('Reverb', backendPath ?? 'No folder (uses Backend path)', reverbRunning, backendPath != null, reverbLoading,
              () => reverbRunning ? _stopReverb() : _startReverb(), () => _showServerMenu('reverb')),
          Container(height: 1, color: AppColors.border),
          _buildServerRow('Frontend', frontendPath ?? 'No folder', frontendRunning, frontendPath != null, frontendLoading,
              () => frontendRunning ? _stopFrontend() : _startFrontend(), () => _showServerMenu('frontend')),
          Container(height: 1, color: AppColors.border),
          const SizedBox(height: AppSpacing.lg),
          _buildPortStatusSection(),
          const SizedBox(height: AppSpacing.lg),
          _buildLanSection(),
          const SizedBox(height: AppSpacing.lg),
          _buildSwitchToCmdSection(),
        ],
      ),
    );
  }
  
  Widget _buildSwitchToCmdSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      child: GestureDetector(
        onTap: _switchToCmd,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
          decoration: BoxDecoration(
            border: AppBorders.all,
            borderRadius: AppBorders.radius,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.terminal, size: 14, color: AppColors.text),
              const SizedBox(width: AppSpacing.sm),
              Text('Switch to CMD', style: AppTextStyles.body.copyWith(fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }
  
  Future<void> _switchToCmd() async {
    if (!Platform.isWindows) return;
    
    // Stop all running servers first
    if (backendRunning) await _stopBackendAsync();
    if (reverbRunning) await _stopReverbAsync();
    if (frontendRunning) await _stopFrontendAsync();
    
    await Future.delayed(const Duration(milliseconds: 300));
    
    // Open CMD windows in the respective directories
    if (backendPath != null) {
      await Process.start('cmd.exe', ['/k', 'cd /d "$backendPath" && echo Backend directory - ready'], runInShell: true);
    }
    if (frontendPath != null && frontendPath != backendPath) {
      await Process.start('cmd.exe', ['/k', 'cd /d "$frontendPath" && echo Frontend directory - ready'], runInShell: true);
    }
  }
  
  Widget _buildLanSection() {
    final anyServerRunning = backendRunning || reverbRunning || frontendRunning;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Always show local IP at top
        if (localIp != null)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.hover,
                borderRadius: AppBorders.radius,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.computer, size: 16, color: AppColors.textMuted),
                  const SizedBox(width: 8),
                  Text('Your IP: ', style: AppTextStyles.body.copyWith(fontSize: 12)),
                  Text(localIp!, style: AppTextStyles.mono.copyWith(fontSize: 14, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ),
        const SizedBox(height: AppSpacing.md),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: Row(
            children: [
              Text('LAN Mode', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(width: AppSpacing.md),
              GestureDetector(
                onTap: () => _toggleLanMode(),
                child: Container(
                  width: 40, height: 20,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    color: lanMode ? AppColors.text : AppColors.border,
                  ),
                  child: AnimatedAlign(
                    duration: const Duration(milliseconds: 150),
                    alignment: lanMode ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      width: 16, height: 16,
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.white),
                    ),
                  ),
                ),
              ),
              if (anyServerRunning) ...[
                const SizedBox(width: AppSpacing.sm),
                Text('(will auto-restart servers)', style: AppTextStyles.body.copyWith(fontSize: 11, color: AppColors.textMuted)),
              ],
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: Text(
            lanMode 
              ? 'ON: Other devices on your network can connect'
              : 'OFF: Only localhost can connect',
            style: AppTextStyles.body.copyWith(fontSize: 11, color: AppColors.textMuted),
          ),
        ),
        if (lanMode) ...[
          const SizedBox(height: AppSpacing.md),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            child: Row(
              children: [
                Text('Connected Devices', style: AppTextStyles.body.copyWith(fontSize: 12, fontWeight: FontWeight.w500)),
                const SizedBox(width: AppSpacing.sm),
                InkWell(
                  onTap: scanningDevices ? null : _scanConnectedDevices,
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.all(4),
                    child: scanningDevices
                        ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 1.5, color: AppColors.textMuted))
                        : const Icon(Icons.refresh, size: 14, color: AppColors.textMuted),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            child: connectedDevices.isEmpty
                ? Text('No devices found. Click refresh to scan.', style: AppTextStyles.body.copyWith(fontSize: 11, color: AppColors.textMuted))
                : Wrap(
                    spacing: AppSpacing.sm,
                    runSpacing: AppSpacing.sm,
                    children: connectedDevices.map((ip) => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
                      child: Text(ip, style: AppTextStyles.mono.copyWith(fontSize: 11)),
                    )).toList(),
                  ),
          ),
        ],
      ],
    );
  }
  
  void _toggleLanMode() async {
    final wasRunning = {
      'backend': backendRunning,
      'reverb': reverbRunning,
      'frontend': frontendRunning,
    };
    
    setState(() => lanMode = !lanMode);
    await _saveLanMode();
    
    // If any servers were running, restart them with new LAN mode setting
    if (wasRunning['backend']! || wasRunning['reverb']! || wasRunning['frontend']!) {
      // Show loading state
      setState(() {
        if (wasRunning['backend']!) backendLoading = true;
        if (wasRunning['reverb']!) reverbLoading = true;
        if (wasRunning['frontend']!) frontendLoading = true;
      });
      
      // Stop all running servers
      if (wasRunning['backend']!) await _stopBackendAsync();
      if (wasRunning['reverb']!) await _stopReverbAsync();
      if (wasRunning['frontend']!) await _stopFrontendAsync();
      
      await Future.delayed(const Duration(milliseconds: 500));
      
      // Restart them with new LAN mode (--host=0.0.0.0 or not)
      if (wasRunning['backend']!) _startBackend();
      if (wasRunning['reverb']!) _startReverb();
      if (wasRunning['frontend']!) _startFrontend();
    }
  }
  
  Future<void> _stopBackendAsync() async {
    backendProcess?.kill();
    await _killProcessOnPort(8000);
    if (mounted) setState(() { backendRunning = false; activePorts['Backend'] = []; });
  }
  
  Future<void> _stopReverbAsync() async {
    reverbProcess?.kill();
    await _killProcessOnPort(8080);
    if (mounted) setState(() { reverbRunning = false; activePorts['Reverb'] = []; });
  }
  
  Future<void> _stopFrontendAsync() async {
    frontendProcess?.kill();
    await _killProcessOnPort(5173);
    await _killProcessOnPort(5174);
    await _killProcessOnPort(5175);
    await _killProcessOnPort(5176);
    if (mounted) setState(() { frontendRunning = false; activePorts['Frontend'] = []; });
  }
  
  Widget _buildPortStatusSection() {
    final allPorts = <MapEntry<String, int>>[];
    activePorts.forEach((server, ports) {
      for (var port in ports) {
        allPorts.add(MapEntry(server, port));
      }
    });
    
    if (allPorts.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
        child: Text('No active ports', style: AppTextStyles.body.copyWith(fontSize: 12, color: AppColors.textMuted)),
      );
    }
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: Row(
            children: [
              Text('Active Ports', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(width: AppSpacing.sm),
              GestureDetector(
                onTap: _checkRunningServers,
                child: const Icon(Icons.refresh, size: 14, color: AppColors.textMuted),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: allPorts.map((entry) => _buildPortChip(entry.key, entry.value)).toList(),
          ),
        ),
      ],
    );
  }
  
  Widget _buildPortChip(String server, int port) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 4),
      decoration: BoxDecoration(
        border: AppBorders.all,
        borderRadius: AppBorders.radius,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6, height: 6,
            decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.text),
          ),
          const SizedBox(width: 6),
          Text(':$port', style: AppTextStyles.mono.copyWith(fontSize: 12, fontWeight: FontWeight.w600)),
          const SizedBox(width: 6),
          Text(server, style: AppTextStyles.body.copyWith(fontSize: 11, color: AppColors.textMuted)),
          const SizedBox(width: 6),
          GestureDetector(
            onTap: () => _stopPort(server, port),
            child: const Icon(Icons.close, size: 14, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }
  
  Future<void> _stopPort(String server, int port) async {
    await _killProcessOnPort(port);
    // Update the active ports list
    setState(() {
      activePorts[server]?.remove(port);
      // Update running status if no ports left for that server
      if (server == 'Backend' && (activePorts['Backend']?.isEmpty ?? true)) {
        backendRunning = false;
      } else if (server == 'Reverb' && (activePorts['Reverb']?.isEmpty ?? true)) {
        reverbRunning = false;
      } else if (server == 'Frontend' && (activePorts['Frontend']?.isEmpty ?? true)) {
        frontendRunning = false;
      }
    });
    // Refresh to confirm
    await Future.delayed(const Duration(milliseconds: 300));
    _checkRunningServers();
  }

  Widget _buildTableHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md, horizontal: AppSpacing.md),
      child: Row(
        children: [
          const SizedBox(width: 24),
          SizedBox(width: 90, child: Text('Server', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, fontSize: 13))),
          Expanded(child: Text('Path', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, fontSize: 13))),
          const SizedBox(width: 90),
        ],
      ),
    );
  }

  Widget _buildServerRow(String name, String path, bool isRunning, bool canRun, bool isLoading, VoidCallback onToggle, VoidCallback onMenu) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md, horizontal: AppSpacing.md),
      child: Row(
        children: [
          SizedBox(width: 24, child: _buildStatusDot(isRunning, isLoading)),
          SizedBox(width: 90, child: Text(name, style: AppTextStyles.body.copyWith(fontSize: 13))),
          Expanded(child: Text(path, style: AppTextStyles.mono.copyWith(fontSize: 12), overflow: TextOverflow.ellipsis)),
          SizedBox(width: 90, child: Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              GestureDetector(
                onTap: (canRun && !isLoading) ? onToggle : null,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 6),
                  decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
                  child: isLoading
                      ? const SizedBox(width: 32, height: 14, child: Center(child: SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 1.5, color: AppColors.text))))
                      : Text(isRunning ? 'Stop' : 'Start', style: AppTextStyles.button.copyWith(fontSize: 12, color: canRun ? AppColors.text : AppColors.disabled)),
                ),
              ),
              const SizedBox(width: 6),
              GestureDetector(onTap: onMenu, child: const Icon(Icons.more_vert, size: 18, color: AppColors.textMuted)),
            ],
          )),
        ],
      ),
    );
  }

  Widget _buildStatusDot(bool isRunning, bool isLoading) {
    if (isLoading) {
      return const SizedBox(
        width: 8, height: 8,
        child: CircularProgressIndicator(strokeWidth: 1.5, color: AppColors.text),
      );
    }
    return Container(
      width: 8, height: 8,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isRunning ? AppColors.text : Colors.transparent,
        border: Border.all(color: AppColors.text, width: 1.5),
      ),
    );
  }


  void _showServerMenu(String type) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.background,
        shape: RoundedRectangleBorder(borderRadius: AppBorders.radius, side: BorderSide(color: AppColors.border)),
        contentPadding: EdgeInsets.zero,
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (type != 'reverb') _menuItem('Select folder', () { Navigator.pop(ctx); _selectFolder(type); }),
            _menuItem('Edit command', () { Navigator.pop(ctx); _editCommand(type); }),
          ],
        ),
      ),
    );
  }

  Widget _menuItem(String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: 150,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
        child: Text(label, style: AppTextStyles.body),
      ),
    );
  }

  void _selectFolder(String type) async {
    if (Platform.isWindows) {
      final result = await Process.run('powershell', ['-Command',
        r'[System.Reflection.Assembly]::LoadWithPartialName("System.windows.forms") | Out-Null; $f = New-Object System.Windows.Forms.FolderBrowserDialog; $f.ShowDialog() | Out-Null; $f.SelectedPath']);
      if (result.stdout.toString().trim().isNotEmpty) {
        setState(() {
          if (type == 'backend') backendPath = result.stdout.toString().trim();
          else frontendPath = result.stdout.toString().trim();
        });
        await _savePaths();
      }
    }
  }

  void _editCommand(String type) {
    String cmd = type == 'backend' ? backendCommand : type == 'reverb' ? reverbCommand : frontendCommand;
    final controller = TextEditingController(text: cmd);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.background,
        shape: RoundedRectangleBorder(borderRadius: AppBorders.radius, side: BorderSide(color: AppColors.border)),
        title: Text('Edit command', style: AppTextStyles.heading),
        content: TextField(
          controller: controller,
          style: AppTextStyles.mono,
          decoration: InputDecoration(border: OutlineInputBorder(borderRadius: AppBorders.radius, borderSide: BorderSide(color: AppColors.border))),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text('Cancel', style: AppTextStyles.button)),
          TextButton(onPressed: () {
            setState(() {
              if (type == 'backend') backendCommand = controller.text;
              else if (type == 'reverb') reverbCommand = controller.text;
              else frontendCommand = controller.text;
            });
            _saveCommands();
            Navigator.pop(ctx);
          }, child: Text('Save', style: AppTextStyles.button)),
        ],
      ),
    );
  }

  void _startBackend() async {
    if (backendPath != null && Platform.isWindows) {
      setState(() => backendLoading = true);
      // Add --host 0.0.0.0 if LAN mode is enabled
      String cmd = backendCommand;
      if (lanMode && !cmd.contains('--host')) {
        cmd = '$cmd --host=0.0.0.0';
      }
      backendProcess = await Process.start('cmd.exe', ['/c', cmd], workingDirectory: backendPath, runInShell: true);
      await Future.delayed(const Duration(milliseconds: 800));
      if (mounted) setState(() { backendRunning = true; backendLoading = false; activePorts['Backend'] = [8000]; });
      backendProcess?.exitCode.then((_) { if (mounted) setState(() { backendRunning = false; activePorts['Backend'] = []; }); });
    }
  }

  void _stopBackend() async {
    setState(() => backendLoading = true);
    backendProcess?.kill();
    // Also kill any process on port 8000 in case it was started externally
    await _killProcessOnPort(8000);
    await Future.delayed(const Duration(milliseconds: 300));
    if (mounted) setState(() { backendRunning = false; backendLoading = false; activePorts['Backend'] = []; });
  }
  
  /// Kill process running on a specific port
  Future<void> _killProcessOnPort(int port) async {
    if (!Platform.isWindows) return;
    try {
      await Process.run('powershell', [
        '-Command',
        'Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }'
      ]);
    } catch (_) {}
  }

  void _startReverb() async {
    if (backendPath != null && Platform.isWindows) {
      setState(() => reverbLoading = true);
      // Add --host 0.0.0.0 if LAN mode is enabled
      String cmd = reverbCommand;
      if (lanMode && !cmd.contains('--host')) {
        cmd = '$cmd --host=0.0.0.0';
      }
      reverbProcess = await Process.start('cmd.exe', ['/c', cmd], workingDirectory: backendPath, runInShell: true);
      await Future.delayed(const Duration(milliseconds: 800));
      if (mounted) setState(() { reverbRunning = true; reverbLoading = false; activePorts['Reverb'] = [8080]; });
      reverbProcess?.exitCode.then((_) { if (mounted) setState(() { reverbRunning = false; activePorts['Reverb'] = []; }); });
    }
  }

  void _stopReverb() async {
    setState(() => reverbLoading = true);
    reverbProcess?.kill();
    // Also kill any process on port 8080 in case it was started externally
    await _killProcessOnPort(8080);
    await Future.delayed(const Duration(milliseconds: 300));
    if (mounted) setState(() { reverbRunning = false; reverbLoading = false; activePorts['Reverb'] = []; });
  }

  void _startFrontend() async {
    if (frontendPath != null && Platform.isWindows) {
      setState(() => frontendLoading = true);
      try { await Process.run('powershell', ['-Command', r'Get-NetTCPConnection -LocalPort 5173,5174,5175,5176 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }']); } catch (_) {}
      await Future.delayed(const Duration(milliseconds: 500));
      // Add --host 0.0.0.0 if LAN mode is enabled (for Vite)
      String cmd = frontendCommand;
      if (lanMode && !cmd.contains('--host')) {
        cmd = '$cmd -- --host';
      }
      frontendProcess = await Process.start('cmd.exe', ['/c', cmd], workingDirectory: frontendPath, runInShell: true);
      await Future.delayed(const Duration(milliseconds: 1200));
      // Check which port vite actually used
      List<int> usedPorts = [];
      for (int port in [5173, 5174, 5175, 5176]) {
        if (await _isPortInUse(port)) usedPorts.add(port);
      }
      if (mounted) setState(() { frontendRunning = true; frontendLoading = false; activePorts['Frontend'] = usedPorts.isNotEmpty ? usedPorts : [5173]; });
      frontendProcess?.exitCode.then((_) { if (mounted) setState(() { frontendRunning = false; activePorts['Frontend'] = []; }); });
    }
  }

  void _stopFrontend() async {
    setState(() => frontendLoading = true);
    frontendProcess?.kill();
    // Also kill any process on frontend ports in case it was started externally
    await _killProcessOnPort(5173);
    await _killProcessOnPort(5174);
    await _killProcessOnPort(5175);
    await _killProcessOnPort(5176);
    await Future.delayed(const Duration(milliseconds: 300));
    if (mounted) setState(() { frontendRunning = false; frontendLoading = false; activePorts['Frontend'] = []; });
  }
}
