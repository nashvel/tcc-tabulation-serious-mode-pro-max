import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;
import '../../theme/app_theme.dart';
import '../../widgets/podium_loader.dart';
import '../create_event_screen.dart';
import 'dev_runner_panel.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int totalEvents = 0;
  int activeEvents = 0;
  int completedEvents = 0;
  List<dynamic> events = [];
  bool isLoading = true;
  late Timer _refreshTimer;
  
  // System stats
  double cpuUsage = 0;
  double ramUsage = 0;
  double ramTotal = 0;
  double ramUsed = 0;
  List<double> cpuHistory = [];
  
  // Dev runner expanded state
  bool devRunnerExpanded = false;
  
  // Server paths for Switch to CMD
  String? backendPath;
  String? frontendPath;
  
  // LAN mode
  bool lanMode = false;
  String? localIp;
  List<String> connectedDevices = [];
  bool scanningDevices = false;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
    _getSystemStats();
    _loadServerPaths();
    _loadLanMode();
    _getLocalIp();
    _refreshTimer = Timer.periodic(const Duration(seconds: 2), (_) {
      _loadDashboardData();
      _getSystemStats();
    });
  }
  
  Future<void> _loadLanMode() async {
    try {
      final configFile = File('${Directory.current.path}/database.json');
      if (await configFile.exists()) {
        final content = await configFile.readAsString();
        final json = jsonDecode(content);
        if (mounted) setState(() => lanMode = json['lanMode'] ?? false);
      }
    } catch (_) {}
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
    } catch (_) {}
  }
  
  Future<void> _getLocalIp() async {
    try {
      final interfaces = await NetworkInterface.list(
        type: InternetAddressType.IPv4,
        includeLoopback: false,
      );
      for (var interface in interfaces) {
        for (var addr in interface.addresses) {
          final ip = addr.address;
          if (!ip.startsWith('127.') && !ip.startsWith('169.254.')) {
            if (mounted) setState(() => localIp = ip);
            return;
          }
        }
      }
    } catch (_) {}
  }
  
  Future<void> _scanConnectedDevices() async {
    if (!Platform.isWindows || localIp == null || scanningDevices) return;
    setState(() => scanningDevices = true);
    try {
      final result = await Process.run('arp', ['-a']);
      final lines = result.stdout.toString().split('\n');
      final devices = <String>[];
      for (var line in lines) {
        final match = RegExp(r'(\d+\.\d+\.\d+\.\d+)').firstMatch(line);
        if (match != null) {
          final ip = match.group(1)!;
          if (!ip.startsWith('255.') && !ip.endsWith('.255') && !ip.endsWith('.1') &&
              ip != localIp && !ip.startsWith('224.') && !ip.startsWith('239.') && !ip.startsWith('169.254.')) {
            devices.add(ip);
          }
        }
      }
      if (mounted) setState(() => connectedDevices = devices);
    } catch (_) {}
    if (mounted) setState(() => scanningDevices = false);
  }
  
  void _toggleLanMode() {
    setState(() => lanMode = !lanMode);
    _saveLanMode();
  }
  
  Future<void> _loadServerPaths() async {
    try {
      final configFile = File('${Directory.current.path}/server_paths.json');
      if (await configFile.exists()) {
        final content = await configFile.readAsString();
        final json = jsonDecode(content);
        if (mounted) {
          setState(() {
            backendPath = json['backendPath'];
            frontendPath = json['frontendPath'];
          });
        }
      }
    } catch (_) {}
  }
  
  Future<void> _switchToCmd() async {
    if (!Platform.isWindows) return;
    
    // Kill processes on common ports
    await _killProcessOnPort(8000);
    await _killProcessOnPort(8080);
    await _killProcessOnPort(5173);
    await _killProcessOnPort(5174);
    
    await Future.delayed(const Duration(milliseconds: 300));
    
    // Open CMD windows
    if (backendPath != null) {
      await Process.start('cmd.exe', ['/k', 'cd /d "$backendPath" && echo Backend directory - ready'], runInShell: true);
    }
    if (frontendPath != null && frontendPath != backendPath) {
      await Process.start('cmd.exe', ['/k', 'cd /d "$frontendPath" && echo Frontend directory - ready'], runInShell: true);
    }
  }
  
  Future<void> _killProcessOnPort(int port) async {
    if (!Platform.isWindows) return;
    try {
      await Process.run('powershell', [
        '-Command',
        'Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }'
      ]);
    } catch (_) {}
  }
  
  Future<void> _getSystemStats() async {
    if (!Platform.isWindows || !mounted) return;
    try {
      // Get CPU usage
      final cpuResult = await Process.run('wmic', ['cpu', 'get', 'loadpercentage']);
      final cpuLines = cpuResult.stdout.toString().trim().split('\n');
      if (cpuLines.length > 1) {
        final cpuValue = cpuLines[1].trim();
        if (cpuValue.isNotEmpty && mounted) {
          final newCpuUsage = double.tryParse(cpuValue) ?? 0;
          setState(() {
            cpuUsage = newCpuUsage;
            cpuHistory.add(newCpuUsage);
            if (cpuHistory.length > 20) cpuHistory.removeAt(0);
          });
        }
      }
      // Get RAM usage
      final ramResult = await Process.run('wmic', ['OS', 'get', 'FreePhysicalMemory,TotalVisibleMemorySize', '/Value']);
      final ramOutput = ramResult.stdout.toString();
      final freeMatch = RegExp(r'FreePhysicalMemory=(\d+)').firstMatch(ramOutput);
      final totalMatch = RegExp(r'TotalVisibleMemorySize=(\d+)').firstMatch(ramOutput);
      if (freeMatch != null && totalMatch != null && mounted) {
        final freeKB = double.parse(freeMatch.group(1)!);
        final totalKB = double.parse(totalMatch.group(1)!);
        final usedKB = totalKB - freeKB;
        setState(() {
          ramTotal = totalKB / 1024 / 1024;
          ramUsed = usedKB / 1024 / 1024;
          ramUsage = (usedKB / totalKB) * 100;
        });
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _refreshTimer.cancel();
    super.dispose();
  }

  Future<void> _loadDashboardData() async {
    try {
      await _fetchFromBackend();
    } catch (e) {
      await _loadFromLocal();
    }
  }

  Future<void> _fetchFromBackend() async {
    try {
      final response = await http.get(
        Uri.parse('http://localhost:8000/api/events'),
      ).timeout(const Duration(seconds: 3));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is List && mounted) {
          setState(() {
            events = data;
            totalEvents = data.length;
            activeEvents = data.where((e) => e['status'] == 'Active').length;
            completedEvents = data.where((e) => e['status'] == 'Completed').length;
            isLoading = false;
          });
        }
      }
    } catch (e) {
      await _loadFromLocal();
    }
  }

  Future<void> _loadFromLocal() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = File('${directory.path}/events.json');
      if (await file.exists()) {
        final contents = await file.readAsString();
        final data = jsonDecode(contents);
        if (data is List && mounted) {
          setState(() {
            events = data;
            totalEvents = data.length;
            activeEvents = data.where((e) => e['status'] == 'Active').length;
            completedEvents = data.where((e) => e['status'] == 'Completed').length;
            isLoading = false;
          });
        }
      } else {
        if (mounted) setState(() => isLoading = false);
      }
    } catch (e) {
      if (mounted) setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.background,
      child: isLoading
          ? const Center(child: PodiumLoader(size: 24))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Stats row - compact
                  _buildStatsRow(),
                  const SizedBox(height: AppSpacing.lg),
                  // System status row
                  _buildSystemStatus(),
                  const SizedBox(height: AppSpacing.lg),
                  // Recent events
                  _buildRecentEventsSection(),
                  const SizedBox(height: AppSpacing.lg),
                  // LAN section
                  _buildLanSection(),
                  const SizedBox(height: AppSpacing.lg),
                  // Dev Runner section
                  _buildDevRunnerSection(),
                ],
              ),
            ),
    );
  }
  
  Widget _buildLanSection() {
    return Container(
      decoration: BoxDecoration(
        border: AppBorders.all,
        borderRadius: AppBorders.radius,
      ),
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // IP and LAN toggle row
          Row(
            children: [
              if (localIp != null) ...[
                const Icon(Icons.computer, size: 14, color: AppColors.textMuted),
                const SizedBox(width: 6),
                Text(localIp!, style: AppTextStyles.mono.copyWith(fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(width: AppSpacing.lg),
              ],
              Text('LAN', style: AppTextStyles.body.copyWith(fontSize: 12)),
              const SizedBox(width: AppSpacing.sm),
              GestureDetector(
                onTap: _toggleLanMode,
                child: Container(
                  width: 36, height: 18,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(9),
                    color: lanMode ? AppColors.text : AppColors.border,
                  ),
                  child: AnimatedAlign(
                    duration: const Duration(milliseconds: 150),
                    alignment: lanMode ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      width: 14, height: 14,
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.white),
                    ),
                  ),
                ),
              ),
              const Spacer(),
              Text(lanMode ? 'Network access ON' : 'Localhost only', style: AppTextStyles.small),
            ],
          ),
          // Connected devices (only when LAN mode is on)
          if (lanMode) ...[
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Text('Devices', style: AppTextStyles.body.copyWith(fontSize: 11, fontWeight: FontWeight.w500)),
                const SizedBox(width: AppSpacing.sm),
                GestureDetector(
                  onTap: scanningDevices ? null : _scanConnectedDevices,
                  child: scanningDevices
                      ? const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 1.5, color: AppColors.textMuted))
                      : const Icon(Icons.refresh, size: 12, color: AppColors.textMuted),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            connectedDevices.isEmpty
                ? Text('No devices. Tap refresh to scan.', style: AppTextStyles.small)
                : Wrap(
                    spacing: AppSpacing.sm,
                    runSpacing: AppSpacing.sm,
                    children: connectedDevices.map((ip) => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
                      child: Text(ip, style: AppTextStyles.mono.copyWith(fontSize: 10)),
                    )).toList(),
                  ),
          ],
        ],
      ),
    );
  }
  
  Widget _buildDevRunnerSection() {
    return Container(
      decoration: BoxDecoration(
        border: AppBorders.all,
        borderRadius: AppBorders.radius,
      ),
      child: Column(
        children: [
          // Header
          GestureDetector(
            onTap: () => setState(() => devRunnerExpanded = !devRunnerExpanded),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
              child: Row(
                children: [
                  Icon(
                    devRunnerExpanded ? Icons.expand_less : Icons.expand_more,
                    size: 16,
                    color: AppColors.textMuted,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text('Dev Servers', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, fontSize: 12)),
                  const Spacer(),
                  Text(devRunnerExpanded ? 'collapse' : 'expand', style: AppTextStyles.small),
                ],
              ),
            ),
          ),
          // Content
          if (devRunnerExpanded) ...[
            Container(height: 1, color: AppColors.border),
            const DevRunnerPanel(),
          ],
        ],
      ),
    );
  }
  
  Widget _buildSystemStatus() {
    return Row(
      children: [
        // CPU with mini chart
        Expanded(child: _buildCpuCard()),
        const SizedBox(width: AppSpacing.md),
        // RAM
        Expanded(child: _buildRamCard()),
      ],
    );
  }
  
  Widget _buildCpuCard() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        border: AppBorders.all,
        borderRadius: AppBorders.radius,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('CPU', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, fontSize: 11)),
              const Spacer(),
              Text('${cpuUsage.toStringAsFixed(0)}%', style: AppTextStyles.mono.copyWith(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.text)),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          // Mini line chart
          SizedBox(
            height: 32,
            child: CustomPaint(
              size: const Size(double.infinity, 32),
              painter: _MiniChartPainter(cpuHistory),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildRamCard() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        border: AppBorders.all,
        borderRadius: AppBorders.radius,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('RAM', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, fontSize: 11)),
              const Spacer(),
              Text('${ramUsed.toStringAsFixed(1)}/${ramTotal.toStringAsFixed(0)}GB', style: AppTextStyles.mono.copyWith(fontSize: 11, color: AppColors.textMuted)),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          // Progress bar
          Container(
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.border,
              borderRadius: BorderRadius.circular(2),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: ramUsage / 100,
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.text,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text('${ramUsage.toStringAsFixed(0)}%', style: AppTextStyles.mono.copyWith(fontSize: 11, color: AppColors.textMuted)),
        ],
      ),
    );
  }

  Widget _buildStatsRow() {
    return Row(
      children: [
        _buildStatItem('Total', totalEvents),
        const SizedBox(width: AppSpacing.lg),
        _buildStatItem('Active', activeEvents),
        const SizedBox(width: AppSpacing.lg),
        _buildStatItem('Done', completedEvents),
        const Spacer(),
        // Switch to CMD button
        GestureDetector(
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
                const SizedBox(width: 4),
                Text('CMD', style: AppTextStyles.button.copyWith(fontSize: 11)),
              ],
            ),
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        // New Event button
        GestureDetector(
          onTap: () => Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const CreateEventScreen()),
          ).then((_) => _loadDashboardData()),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
            decoration: BoxDecoration(
              color: AppColors.text,
              borderRadius: AppBorders.radius,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.add, size: 14, color: Colors.white),
                const SizedBox(width: 4),
                Text('New Event', style: AppTextStyles.button.copyWith(color: Colors.white, fontSize: 11)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatItem(String label, int value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
      decoration: BoxDecoration(
        border: AppBorders.all,
        borderRadius: AppBorders.radius,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('$value', style: AppTextStyles.heading.copyWith(fontSize: 16)),
          const SizedBox(width: AppSpacing.sm),
          Text(label, style: AppTextStyles.small),
        ],
      ),
    );
  }

  Widget _buildRecentEventsSection() {
    if (events.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          border: AppBorders.all,
          borderRadius: AppBorders.radius,
        ),
        child: Column(
          children: [
            const Icon(Icons.event_outlined, size: 24, color: AppColors.disabled),
            const SizedBox(height: AppSpacing.sm),
            Text('No events yet', style: AppTextStyles.body.copyWith(color: AppColors.textMuted, fontSize: 12)),
            const SizedBox(height: 4),
            Text('Create your first event', style: AppTextStyles.small),
          ],
        ),
      );
    }

    final displayEvents = events.length > 5 ? events.sublist(0, 5) : events;
    
    return Container(
      decoration: BoxDecoration(
        border: AppBorders.all,
        borderRadius: AppBorders.radius,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
            child: Text('Recent Events', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, fontSize: 12)),
          ),
          Container(height: 1, color: AppColors.border),
          ...displayEvents.map((event) {
            final status = event['status'] ?? 'Draft';
            final isActive = status == 'Active';
            return Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
                  child: Row(
                    children: [
                      Container(
                        width: 6, height: 6,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isActive ? AppColors.text : Colors.transparent,
                          border: Border.all(color: AppColors.text, width: 1),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Text(
                          event['title'] ?? event['name'] ?? 'Untitled',
                          style: AppTextStyles.body.copyWith(fontSize: 12),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(status, style: AppTextStyles.small),
                    ],
                  ),
                ),
                if (event != displayEvents.last) Container(height: 1, color: AppColors.border),
              ],
            );
          }),
        ],
      ),
    );
  }
}


// Mini line chart painter for CPU history
class _MiniChartPainter extends CustomPainter {
  final List<double> values;
  
  _MiniChartPainter(this.values);
  
  @override
  void paint(Canvas canvas, Size size) {
    if (values.isEmpty) return;
    
    final paint = Paint()
      ..color = AppColors.text
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    
    final fillPaint = Paint()
      ..color = AppColors.text.withOpacity(0.1)
      ..style = PaintingStyle.fill;
    
    final path = Path();
    final fillPath = Path();
    
    final maxVal = values.reduce((a, b) => a > b ? a : b).clamp(1.0, 100.0);
    final minVal = values.reduce((a, b) => a < b ? a : b).clamp(0.0, 99.0);
    final range = (maxVal - minVal).clamp(10.0, 100.0);
    
    for (int i = 0; i < values.length; i++) {
      final x = (i / (values.length - 1).clamp(1, values.length)) * size.width;
      final y = size.height - ((values[i] - minVal) / range * size.height);
      
      if (i == 0) {
        path.moveTo(x, y);
        fillPath.moveTo(x, size.height);
        fillPath.lineTo(x, y);
      } else {
        path.lineTo(x, y);
        fillPath.lineTo(x, y);
      }
    }
    
    fillPath.lineTo(size.width, size.height);
    fillPath.close();
    
    canvas.drawPath(fillPath, fillPaint);
    canvas.drawPath(path, paint);
  }
  
  @override
  bool shouldRepaint(covariant _MiniChartPainter oldDelegate) => true;
}
