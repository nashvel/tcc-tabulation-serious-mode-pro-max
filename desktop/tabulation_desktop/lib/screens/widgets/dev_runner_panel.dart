import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:io';
import 'dart:convert';
import 'dart:async';

class DevRunnerPanel extends StatefulWidget {
  const DevRunnerPanel({super.key});

  @override
  State<DevRunnerPanel> createState() => _DevRunnerPanelState();
}

class _DevRunnerPanelState extends State<DevRunnerPanel> {
  String? backendPath;
  String? frontendPath;
  String backendCommand = 'php artisan serve';
  String frontendCommand = 'npm run dev';
  
  Process? backendProcess;
  Process? frontendProcess;
  bool backendRunning = false;
  bool frontendRunning = false;
  String backendOutput = '';
  String frontendOutput = '';

  @override
  void initState() {
    super.initState();
    _loadPaths();
    _loadCommands();
  }

  @override
  void dispose() {
    backendProcess?.kill();
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
      print('Error loading paths: $e');
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
          frontendCommand = json['frontendCommand'] ?? 'npm run dev';
        });
      }
    } catch (e) {
      print('Error loading commands: $e');
    }
  }

  Future<void> _savePaths() async {
    try {
      final configFile = File('${Directory.current.path}/server_paths.json');
      final json = {
        'backendPath': backendPath,
        'frontendPath': frontendPath,
      };
      await configFile.writeAsString(jsonEncode(json));
    } catch (e) {
      print('Error saving paths: $e');
    }
  }

  Future<void> _saveCommands() async {
    try {
      final configFile = File('${Directory.current.path}/database.json');
      final json = {
        'backendCommand': backendCommand,
        'frontendCommand': frontendCommand,
      };
      await configFile.writeAsString(jsonEncode(json));
    } catch (e) {
      print('Error saving commands: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Backend Section
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.08),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.storage,
                      size: 24,
                      color: Colors.blue.shade700,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Backend Server',
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        Text(
                          backendPath ?? 'Laravel API - No folder selected',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () => _selectBackendFolder(),
                      borderRadius: BorderRadius.circular(8),
                      child: Padding(
                        padding: const EdgeInsets.all(8),
                        child: Icon(
                          Icons.folder_open,
                          color: Colors.blue.shade700,
                          size: 20,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onSecondaryTap: () => _showEditCommandDialog('backend'),
                      child: ElevatedButton.icon(
                        onPressed: backendPath != null 
                          ? () => backendRunning ? _stopBackend() : _startBackend()
                          : null,
                        icon: Icon(backendRunning ? Icons.stop : Icons.play_arrow),
                        label: Text(backendRunning ? 'Stop Backend' : 'Start Backend'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: backendRunning ? Colors.red : Colors.blue,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 12,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.blue,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: backendPath != null && backendRunning 
                          ? () => _switchToTerminal('backend')
                          : null,
                        borderRadius: BorderRadius.circular(8),
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Icon(
                            Icons.terminal,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        // Frontend Section
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.08),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.web,
                      size: 24,
                      color: Colors.blue.shade700,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Frontend Server',
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        Text(
                          frontendPath ?? 'React Dev Server - No folder selected',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () => _selectFrontendFolder(),
                      borderRadius: BorderRadius.circular(8),
                      child: Padding(
                        padding: const EdgeInsets.all(8),
                        child: Icon(
                          Icons.folder_open,
                          color: Colors.blue.shade700,
                          size: 20,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onSecondaryTap: () => _showEditCommandDialog('frontend'),
                      child: ElevatedButton.icon(
                        onPressed: frontendPath != null 
                          ? () => frontendRunning ? _stopFrontend() : _startFrontend()
                          : null,
                        icon: Icon(frontendRunning ? Icons.stop : Icons.play_arrow),
                        label: Text(frontendRunning ? 'Stop Frontend' : 'Start Frontend'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: frontendRunning ? Colors.red : Colors.blue,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 12,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.blue,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: frontendPath != null && frontendRunning 
                          ? () => _switchToTerminal('frontend')
                          : null,
                        borderRadius: BorderRadius.circular(8),
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Icon(
                            Icons.terminal,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _startBackend() async {
    try {
      if (backendPath != null) {
        print('Starting backend at: $backendPath');
        print('Command: $backendCommand');
        
        if (Platform.isWindows) {
          // Open new terminal window and run command
          Process.start(
            'cmd.exe',
            ['/c', 'start cmd.exe /k cmd /c $backendCommand'],
            workingDirectory: backendPath,
          );
          
          setState(() => backendRunning = true);
        } else if (Platform.isMacOS || Platform.isLinux) {
          backendProcess = await Process.start(
            'bash',
            ['-c', '$backendCommand'],
            workingDirectory: backendPath,
          );
          
          setState(() => backendRunning = true);
        }
      }
    } catch (e) {
      print('Error starting backend: $e');
      setState(() => backendRunning = false);
    }
  }

  void _stopBackend() {
    try {
      backendProcess?.kill();
      setState(() {
        backendRunning = false;
        backendOutput = '';
      });
    } catch (e) {
      print('Error stopping backend: $e');
    }
  }

  void _startFrontend() async {
    try {
      if (frontendPath != null) {
        print('Starting frontend at: $frontendPath');
        print('Command: $frontendCommand');
        
        if (Platform.isWindows) {
          // Open new terminal window and run command
          Process.start(
            'cmd.exe',
            ['/c', 'start cmd.exe /k cmd /c $frontendCommand'],
            workingDirectory: frontendPath,
          );
          
          setState(() => frontendRunning = true);
        } else if (Platform.isMacOS || Platform.isLinux) {
          frontendProcess = await Process.start(
            'bash',
            ['-c', '$frontendCommand'],
            workingDirectory: frontendPath,
          );
          
          setState(() => frontendRunning = true);
        }
      }
    } catch (e) {
      print('Error starting frontend: $e');
      setState(() => frontendRunning = false);
    }
  }

  void _stopFrontend() {
    try {
      frontendProcess?.kill();
      setState(() {
        frontendRunning = false;
        frontendOutput = '';
      });
    } catch (e) {
      print('Error stopping frontend: $e');
    }
  }

  void _switchToTerminal(String type) {
    try {
      final path = type == 'backend' ? backendPath : frontendPath;
      if (path != null) {
        // Stop the process first
        if (type == 'backend') {
          _stopBackend();
        } else {
          _stopFrontend();
        }
        
        // Then open terminal
        Future.delayed(const Duration(milliseconds: 500), () {
          if (Platform.isWindows) {
            // Properly escape the path with quotes
            final escapedPath = '"$path"';
            Process.start('cmd.exe', ['/c', 'start', 'cmd.exe', '/K', 'cd /d $escapedPath']);
          } else if (Platform.isMacOS) {
            Process.start('open', ['-a', 'Terminal', path]);
          } else if (Platform.isLinux) {
            Process.start('x-terminal-emulator', ['-e', 'bash', '-c', 'cd "$path"; bash']);
          }
        });
      }
    } catch (e) {
      print('Error switching to terminal: $e');
    }
  }

  void _showEditCommandDialog(String type) {
    final isBackend = type == 'backend';
    final controller = TextEditingController(
      text: isBackend ? backendCommand : frontendCommand,
    );

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Edit ${isBackend ? 'Backend' : 'Frontend'} Command',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        content: TextField(
          controller: controller,
          decoration: InputDecoration(
            hintText: isBackend ? 'php artisan serve' : 'npm run dev',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            contentPadding: const EdgeInsets.all(12),
          ),
          style: GoogleFonts.inter(fontSize: 14),
          maxLines: 3,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: GoogleFonts.inter(color: Colors.grey),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                if (isBackend) {
                  backendCommand = controller.text;
                } else {
                  frontendCommand = controller.text;
                }
              });
              _saveCommands();
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
            ),
            child: Text(
              'Save',
              style: GoogleFonts.inter(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _openTerminal(String type) {
    try {
      final path = type == 'backend' ? backendPath : frontendPath;
      if (path != null) {
        if (Platform.isWindows) {
          Process.start('cmd.exe', ['/c', 'start', 'cmd.exe', '/K', 'cd /d "$path"']);
        } else if (Platform.isMacOS) {
          Process.start('open', ['-a', 'Terminal', path]);
        } else if (Platform.isLinux) {
          Process.start('x-terminal-emulator', ['-e', 'bash', '-c', 'cd "$path"; bash']);
        }
      }
    } catch (e) {
      print('Error opening terminal: $e');
    }
  }

  Future<void> _selectBackendFolder() async {
    try {
      if (Platform.isWindows) {
        // Use Windows file picker
        final result = await Process.run('powershell', [
          '-Command',
          r'[System.Reflection.Assembly]::LoadWithPartialName("System.windows.forms") | Out-Null; $folder = New-Object System.Windows.Forms.FolderBrowserDialog; $folder.ShowDialog() | Out-Null; $folder.SelectedPath'
        ]);
        
        if (result.stdout.toString().trim().isNotEmpty) {
          final path = result.stdout.toString().trim();
          setState(() {
            backendPath = path;
          });
          await _savePaths();
        }
      }
    } catch (e) {
      print('Error selecting backend folder: $e');
    }
  }

  Future<void> _selectFrontendFolder() async {
    try {
      if (Platform.isWindows) {
        // Use Windows file picker
        final result = await Process.run('powershell', [
          '-Command',
          r'[System.Reflection.Assembly]::LoadWithPartialName("System.windows.forms") | Out-Null; $folder = New-Object System.Windows.Forms.FolderBrowserDialog; $folder.ShowDialog() | Out-Null; $folder.SelectedPath'
        ]);
        
        if (result.stdout.toString().trim().isNotEmpty) {
          final path = result.stdout.toString().trim();
          setState(() {
            frontendPath = path;
          });
          await _savePaths();
        }
      }
    } catch (e) {
      print('Error selecting frontend folder: $e');
    }
  }
}
