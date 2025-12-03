import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:io';
import 'dart:async';

class ServerInfoPanel extends StatefulWidget {
  final bool isMobile;
  final double padding;

  const ServerInfoPanel({
    super.key,
    required this.isMobile,
    required this.padding,
  });

  @override
  State<ServerInfoPanel> createState() => _ServerInfoPanelState();
}

class _ServerInfoPanelState extends State<ServerInfoPanel> {
  bool backendRunning = false;
  bool frontendRunning = false;
  String? backendPath;
  String? frontendPath;
  late Timer _refreshTimer;

  @override
  void initState() {
    super.initState();
    _loadAllData();
    // Refresh data every 2 seconds to catch changes from dev runner
    _refreshTimer = Timer.periodic(const Duration(seconds: 2), (_) {
      _loadAllData();
    });
  }

  @override
  void dispose() {
    _refreshTimer.cancel();
    super.dispose();
  }

  Future<void> _loadAllData() async {
    await _loadPaths();
    await _loadServerStatus();
  }

  Future<void> _loadServerStatus() async {
    try {
      final statusFile = File('${Directory.current.path}/server_status.json');
      if (await statusFile.exists()) {
        final content = await statusFile.readAsString();
        final json = jsonDecode(content);
        if (mounted) {
          setState(() {
            backendRunning = json['backendRunning'] ?? false;
            frontendRunning = json['frontendRunning'] ?? false;
            // Use paths from server_status.json if available
            if (json['backendPath'] != null) backendPath = json['backendPath'];
            if (json['frontendPath'] != null) frontendPath = json['frontendPath'];
          });
        }
      }
    } catch (e) {
      print('Error loading server status: $e');
    }
  }

  Future<void> _loadPaths() async {
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
    } catch (e) {
      // Silent fail - paths will show as "No folder selected"
    }
  }

  Future<void> _selectFolder(String type) async {
    try {
      // Open file picker to select folder
      final result = await Process.run('powershell', [
        '-Command',
        r'[System.Reflection.Assembly]::LoadWithPartialName("System.windows.forms") | Out-Null; $FolderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog; $FolderBrowser.ShowDialog() | Out-Null; $FolderBrowser.SelectedPath'
      ]);

      final selectedPath = result.stdout.toString().trim();
      if (selectedPath.isNotEmpty) {
        await _savePath(type, selectedPath);
        if (mounted) {
          setState(() {
            if (type == 'backend') {
              backendPath = selectedPath;
            } else {
              frontendPath = selectedPath;
            }
          });
        }
      }
    } catch (e) {
      print('Error selecting folder: $e');
    }
  }

  Future<void> _savePath(String type, String path) async {
    try {
      final configFile = File('${Directory.current.path}/server_paths.json');
      final json = {
        'backendPath': type == 'backend' ? path : backendPath,
        'frontendPath': type == 'frontend' ? path : frontendPath,
      };
      await configFile.writeAsString(jsonEncode(json));
    } catch (e) {
      // Silent fail
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: EdgeInsets.all(widget.padding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Development Servers',
            style: TextStyle(
              fontSize: widget.isMobile ? 14 : 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: widget.padding),
          _buildInfoBanner(),
          SizedBox(height: widget.padding),
          _buildServerCards(),
        ],
      ),
    );
  }

  Widget _buildInfoBanner() {
    return const SizedBox.shrink(); // Hidden
  }

  Widget _buildServerCards() {
    final backendCard = _buildServerCard(
      title: 'Backend',
      subtitle: 'Laravel API Server',
      url: 'http://localhost:8000',
      icon: Icons.storage,
      color: Colors.green,
      isRunning: backendRunning,
      path: backendPath,
      type: 'backend',
    );

    final frontendCard = _buildServerCard(
      title: 'Frontend',
      subtitle: 'React Admin Panel',
      url: 'http://localhost:5173',
      icon: Icons.language,
      color: Colors.orange,
      isRunning: frontendRunning,
      path: frontendPath,
      type: 'frontend',
    );

    // Always display in a single row
    return Row(
      children: [
        Expanded(child: backendCard),
        SizedBox(width: widget.padding),
        Expanded(child: frontendCard),
      ],
    );
  }

  Widget _buildServerCard({
    required String title,
    required String subtitle,
    required String url,
    required IconData icon,
    required Color color,
    required bool isRunning,
    required String? path,
    required String type,
  }) {
    return Container(
      padding: EdgeInsets.all(widget.padding),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  color: color,
                  size: widget.isMobile ? 16 : 20,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: widget.isMobile ? 12 : 14,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey.shade700,
                      ),
                    ),
                    Container(
                      margin: const EdgeInsets.only(top: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: isRunning ? Colors.green.shade100 : Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        isRunning ? 'Running' : 'Stopped',
                        style: TextStyle(
                          fontSize: widget.isMobile ? 9 : 10,
                          fontWeight: FontWeight.w600,
                          color: isRunning ? Colors.green.shade700 : Colors.grey.shade700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          // Hide subtitle and URL on mobile
          if (!widget.isMobile) ...[
            const SizedBox(height: 12),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              url,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
                fontFamily: 'monospace',
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
          const SizedBox(height: 8),
          // Folder path section - hide on mobile
          if (!widget.isMobile)
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Row(
                children: [
                  Icon(Icons.folder, size: 14, color: Colors.grey.shade600),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      path ?? 'No folder selected',
                      style: TextStyle(
                        fontSize: 10,
                        color: path != null ? Colors.grey.shade700 : Colors.grey.shade500,
                        fontFamily: 'monospace',
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () => _selectFolder(type),
                      borderRadius: BorderRadius.circular(4),
                      child: Padding(
                        padding: const EdgeInsets.all(4),
                        child: Icon(
                          Icons.edit,
                          size: 14,
                          color: Colors.blue.shade600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                _loadServerStatus();
              },
              icon: Icon(isRunning ? Icons.stop : Icons.play_arrow, size: widget.isMobile ? 14 : 16),
              label: Text(isRunning ? 'Stop' : 'Start'),
              style: ElevatedButton.styleFrom(
                backgroundColor: isRunning ? Colors.red : Colors.green,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(
                  vertical: widget.isMobile ? 6 : 8,
                  horizontal: widget.isMobile ? 12 : 16,
                ),
                textStyle: TextStyle(
                  fontSize: widget.isMobile ? 10 : 12,
                  fontWeight: FontWeight.w600,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(widget.isMobile ? 6 : 8),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Extension to get shade colors easily
extension ColorShade on Color {
  Color get shade50 {
    if (this == Colors.green) return Colors.green.shade50;
    if (this == Colors.orange) return Colors.orange.shade50;
    if (this == Colors.blue) return Colors.blue.shade50;
    return withOpacity(0.1);
  }

  Color get shade200 {
    if (this == Colors.green) return Colors.green.shade200;
    if (this == Colors.orange) return Colors.orange.shade200;
    if (this == Colors.blue) return Colors.blue.shade200;
    return withOpacity(0.3);
  }

  Color get shade600 {
    if (this == Colors.green) return Colors.green.shade600;
    if (this == Colors.orange) return Colors.orange.shade600;
    if (this == Colors.blue) return Colors.blue.shade600;
    return this;
  }

  Color get shade700 {
    if (this == Colors.green) return Colors.green.shade700;
    if (this == Colors.orange) return Colors.orange.shade700;
    if (this == Colors.blue) return Colors.blue.shade700;
    return this;
  }
}
