import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../create_event_screen.dart';
import '../../utils/responsive.dart';
import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

class SetupScreen extends StatefulWidget {
  const SetupScreen({super.key});

  @override
  State<SetupScreen> createState() => _SetupScreenState();
}

class _SetupScreenState extends State<SetupScreen> {
  List<dynamic> events = [];
  bool isLoading = true;
  Map<int, bool> expandedEvents = {};
  late Timer _refreshTimer;

  @override
  void initState() {
    super.initState();
    _loadEvents();
    // Auto-refresh every 2 seconds
    _refreshTimer = Timer.periodic(const Duration(seconds: 2), (_) {
      _loadEvents();
    });
  }

  @override
  void dispose() {
    _refreshTimer.cancel();
    super.dispose();
  }

  Future<void> _loadEvents() async {
    try {
      // Try to fetch from backend API first
      final response = await Future.any([
        Future.delayed(const Duration(seconds: 1)),
        _fetchFromBackend(),
      ]).catchError((_) => _loadFromLocal());

      if (response != null) {
        return;
      }

      // Fallback to local storage
      await _loadFromLocal();
    } catch (e) {
      print('Error loading events: $e');
      await _loadFromLocal();
    }
  }

  Future<dynamic> _fetchFromBackend() async {
    try {
      final response = await http.get(
        Uri.parse('http://localhost:8000/api/events'),
      ).timeout(const Duration(seconds: 3));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        
        if (data is List && mounted) {
          setState(() {
            events = data;
            isLoading = false;
          });
          return true;
        }
      }
    } catch (e) {
      print('Backend fetch failed: $e');
    }
    return null;
  }

  Future<void> _loadFromLocal() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = File('${directory.path}/events.json');

      if (await file.exists()) {
        final contents = await file.readAsString();
        final data = jsonDecode(contents);
        
        if (mounted) {
          setState(() {
            events = data is List ? data : [];
            isLoading = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            events = [];
            isLoading = false;
          });
        }
      }
    } catch (e) {
      print('Error loading from local: $e');
      if (mounted) {
        setState(() {
          events = [];
          isLoading = false;
        });
      }
    }
  }

  Future<void> _continueEvent(dynamic event) async {
    try {
      // Save event to localStorage (using local file as localStorage equivalent)
      final directory = await getApplicationDocumentsDirectory();
      final file = File('${directory.path}/continuingEvent.json');
      await file.writeAsString(jsonEncode(event));

      // Get event title for URL parameter
      final eventTitle = event['title'] ?? 'Event';
      
      // Open browser with admin panel
      final url = Uri.parse('http://localhost:5173/admin?event_title=${Uri.encodeComponent(eventTitle)}');
      
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open browser')),
        );
      }
    } catch (e) {
      print('Error continuing event: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  Future<void> _deleteEvent(int index) async {
    final event = events[index];
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Delete Event',
          style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Are you sure you want to delete "${event['title']}"?',
              style: GoogleFonts.inter(),
            ),
            const SizedBox(height: 16),
            TextField(
              decoration: InputDecoration(
                hintText: 'Type event title to confirm',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onChanged: (value) {
                // Handle confirmation
              },
            ),
          ],
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
            onPressed: () async {
              try {
                setState(() {
                  events.removeAt(index);
                });
                
                final directory = await getApplicationDocumentsDirectory();
                final file = File('${directory.path}/events.json');
                await file.writeAsString(jsonEncode(events));
                
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Event deleted successfully')),
                );
              } catch (e) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Error deleting event: $e')),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: Text(
              'Delete',
              style: GoogleFonts.inter(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey.shade50,
      child: Column(
        children: [
          // Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(24),
            child: Row(
              children: [
                const Text(
                  'Event Setup',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const CreateEventScreen(),
                      ),
                    );
                  },
                  icon: const Icon(Icons.add),
                  label: const Text('Create New Event'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 16,
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Content
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : events.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.event_note,
                              size: ResponsiveHelper.isMobile(context) ? 48 : 64,
                              color: Colors.grey.shade300,
                            ),
                            SizedBox(height: ResponsiveHelper.getPadding(context)),
                            Text(
                              'No events yet',
                              style: TextStyle(
                                fontSize: ResponsiveHelper.getFontSize(context, 18),
                                color: Colors.grey.shade600,
                              ),
                            ),
                            SizedBox(height: ResponsiveHelper.getPadding(context) * 0.5),
                            Text(
                              'Create a new event to get started',
                              style: TextStyle(
                                fontSize: ResponsiveHelper.getFontSize(context, 14),
                                color: Colors.grey.shade500,
                              ),
                            ),
                          ],
                        ),
                      )
                    : Padding(
                        padding: EdgeInsets.all(ResponsiveHelper.getPadding(context)),
                        child: ListView.builder(
                          itemCount: events.length,
                          itemBuilder: (context, index) {
                            final event = events[index];
                            final isExpanded = expandedEvents[index] ?? false;

                            return Container(
                              margin: const EdgeInsets.only(bottom: 16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.05),
                                    blurRadius: 8,
                                  ),
                                ],
                              ),
                              child: Column(
                                children: [
                                  // Event Header
                                  InkWell(
                                    onTap: () {
                                      setState(() {
                                        expandedEvents[index] = !isExpanded;
                                      });
                                    },
                                    child: Padding(
                                      padding: const EdgeInsets.all(16),
                                      child: Row(
                                        children: [
                                          Container(
                                            width: 48,
                                            height: 48,
                                            decoration: BoxDecoration(
                                              color: Colors.blue.shade100,
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                            ),
                                            child: Icon(
                                              Icons.event,
                                              color: Colors.blue.shade900,
                                            ),
                                          ),
                                          const SizedBox(width: 16),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  event['title'] ?? 'Untitled',
                                                  style: const TextStyle(
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  'Created on ${event['createdAt'] ?? 'Unknown'}',
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    color: Colors.grey.shade600,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          Chip(
                                            label: Text(
                                              event['status'] ?? 'Active',
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            backgroundColor:
                                                _getStatusColor(event['status']),
                                            labelStyle: TextStyle(
                                              color: _getStatusTextColor(
                                                  event['status']),
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          const SizedBox(width: 16),
                                          Icon(
                                            isExpanded
                                                ? Icons.expand_less
                                                : Icons.expand_more,
                                            color: Colors.grey.shade600,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  // Expanded Details
                                  if (isExpanded)
                                    Container(
                                      decoration: BoxDecoration(
                                        border: Border(
                                          top: BorderSide(
                                            color: Colors.grey.shade200,
                                          ),
                                        ),
                                      ),
                                      padding: const EdgeInsets.all(16),
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          _buildDetailRow(
                                            'Title',
                                            event['title'] ?? 'N/A',
                                          ),
                                          const SizedBox(height: 12),
                                          _buildDetailRow(
                                            'Description',
                                            event['description'] ?? 'N/A',
                                          ),
                                          const SizedBox(height: 12),
                                          _buildDetailRow(
                                            'Date',
                                            event['date'] ?? 'N/A',
                                          ),
                                          const SizedBox(height: 12),
                                          _buildDetailRow(
                                            'Location',
                                            event['location'] ?? 'N/A',
                                          ),
                                          const SizedBox(height: 16),
                                          Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.end,
                                            children: [
                                              ElevatedButton.icon(
                                                onPressed: () => _continueEvent(event),
                                                icon: const Icon(Icons.play_arrow),
                                                label: const Text('Continue'),
                                                style: ElevatedButton.styleFrom(
                                                  backgroundColor: Colors.green,
                                                  foregroundColor: Colors.white,
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              ElevatedButton.icon(
                                                onPressed: () =>
                                                    _deleteEvent(index),
                                                icon: const Icon(Icons.delete),
                                                label: const Text('Delete'),
                                                style: ElevatedButton.styleFrom(
                                                  backgroundColor: Colors.red,
                                                  foregroundColor: Colors.white,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade600,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.black87,
            ),
          ),
        ),
      ],
    );
  }

  Color _getStatusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'active':
        return Colors.green.shade100;
      case 'completed':
        return Colors.orange.shade100;
      case 'draft':
        return Colors.grey.shade100;
      default:
        return Colors.blue.shade100;
    }
  }

  Color _getStatusTextColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'active':
        return Colors.green.shade900;
      case 'completed':
        return Colors.orange.shade900;
      case 'draft':
        return Colors.grey.shade900;
      default:
        return Colors.blue.shade900;
    }
  }
}
