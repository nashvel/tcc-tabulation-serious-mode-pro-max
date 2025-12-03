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
    _loadServerStatus();
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

  Future<void> _saveServerStatus() async {
    try {
      final statusFile = File('${Directory.current.path}/server_status.json');
      final json = {
        'backendRunning': backendRunning,
        'frontendRunning': frontendRunning,
        'backendPath': backendPath,
        'frontendPath': frontendPath,
        'backendCommand': backendCommand,
        'frontendCommand': frontendCommand,
        'timestamp': DateTime.now().toIso8601String(),
      };
      await statusFile.writeAsString(jsonEncode(json));
      print('Server status saved to server_status.json');
    } catch (e) {
      print('Error saving server status: $e');
    }
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
          });
        }
      }
    } catch (e) {
      // Silent fail
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
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(12),
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
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(12),
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
          // Run as background process (no terminal window)
          backendProcess = await Process.start(
            'cmd.exe',
            ['/c', '$backendCommand'],
            workingDirectory: backendPath,
            runInShell: true,
          );
          
          print('Backend process started with PID: ${backendProcess?.pid}');
          setState(() => backendRunning = true);
          await _saveServerStatus();
          
          // Listen to output
          backendProcess?.stdout.transform(utf8.decoder).listen((data) {
            if (mounted) {
              setState(() => backendOutput += data);
            }
            print('Backend: $data');
          });
          
          backendProcess?.stderr.transform(utf8.decoder).listen((data) {
            if (mounted) {
              setState(() => backendOutput += data);
            }
            print('Backend Error: $data');
          });
          
          // Handle process exit
          backendProcess?.exitCode.then((_) {
            if (mounted) {
              setState(() => backendRunning = false);
              print('Backend process exited');
            }
          });
        } else if (Platform.isMacOS || Platform.isLinux) {
          backendProcess = await Process.start(
            'bash',
            ['-c', '$backendCommand'],
            workingDirectory: backendPath,
          );
          
          setState(() => backendRunning = true);
          
          backendProcess?.stdout.transform(utf8.decoder).listen((data) {
            if (mounted) {
              setState(() => backendOutput += data);
            }
          });
          
          backendProcess?.exitCode.then((_) {
            if (mounted) {
              setState(() => backendRunning = false);
            }
          });
        }
      }
    } catch (e) {
      print('Error starting backend: $e');
      setState(() => backendRunning = false);
    }
  }

  void _stopBackend() async {
    try {
      backendProcess?.kill();
      setState(() {
        backendRunning = false;
        backendOutput = '';
      });
      await _saveServerStatus();
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
          // Kill any existing processes on ports 5173-5176
          try {
            await Process.run('powershell', [
              '-Command',
              r'Get-NetTCPConnection -LocalPort 5173,5174,5175,5176 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id (Get-NetTCPConnection -LocalPort $_.LocalPort | Select-Object -ExpandProperty OwningProcess) -Force -ErrorAction SilentlyContinue }'
            ]);
            print('Killed existing processes on ports 5173-5176');
          } catch (e) {
            print('Could not kill existing processes: $e');
          }
          
          // Wait a moment for ports to be released
          await Future.delayed(const Duration(milliseconds: 500));
          
          // Run as background process (no terminal window)
          frontendProcess = await Process.start(
            'cmd.exe',
            ['/c', '$frontendCommand'],
            workingDirectory: frontendPath,
            runInShell: true,
          );
          
          print('Frontend process started with PID: ${frontendProcess?.pid}');
          setState(() => frontendRunning = true);
          await _saveServerStatus();
          
          // Listen to output
          frontendProcess?.stdout.transform(utf8.decoder).listen((data) {
            if (mounted) {
              setState(() => frontendOutput += data);
            }
            print('Frontend: $data');
          });
          
          frontendProcess?.stderr.transform(utf8.decoder).listen((data) {
            if (mounted) {
              setState(() => frontendOutput += data);
            }
            print('Frontend Error: $data');
          });
          
          // Handle process exit
          frontendProcess?.exitCode.then((_) {
            if (mounted) {
              setState(() => frontendRunning = false);
              print('Frontend process exited');
            }
          });
        } else if (Platform.isMacOS || Platform.isLinux) {
          // Kill any existing processes on ports 5173-5176
          try {
            await Process.run('bash', [
              '-c',
              'lsof -ti:5173,5174,5175,5176 | xargs kill -9 2>/dev/null || true'
            ]);
            print('Killed existing processes on ports 5173-5176');
          } catch (e) {
            print('Could not kill existing processes: $e');
          }
          
          await Future.delayed(const Duration(milliseconds: 500));
          
          frontendProcess = await Process.start(
            'bash',
            ['-c', '$frontendCommand'],
            workingDirectory: frontendPath,
          );
          
          setState(() => frontendRunning = true);
          
          frontendProcess?.stdout.transform(utf8.decoder).listen((data) {
            if (mounted) {
              setState(() => frontendOutput += data);
            }
          });
          
          frontendProcess?.exitCode.then((_) {
            if (mounted) {
              setState(() => frontendRunning = false);
            }
          });
        }
      }
    } catch (e) {
      print('Error starting frontend: $e');
      setState(() => frontendRunning = false);
    }
  }

  void _stopFrontend() async {
    try {
      frontendProcess?.kill();
      setState(() {
        frontendRunning = false;
        frontendOutput = '';
      });
      await _saveServerStatus();
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
