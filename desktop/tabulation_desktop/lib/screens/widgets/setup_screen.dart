import 'package:flutter/material.dart';
import 'dart:async';
import 'setup/event_service.dart';
import 'setup/setup_header.dart';
import 'setup/event_card.dart';
import 'setup/delete_event_dialog.dart';
import 'setup/empty_events_view.dart';

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
      final backendEvents = await EventService.fetchFromBackend();
      
      if (backendEvents != null && mounted) {
        setState(() {
          events = backendEvents;
          isLoading = false;
        });
        return;
      }

      // Fallback to local storage
      final localEvents = await EventService.loadFromLocal();
      if (mounted) {
        setState(() {
          events = localEvents;
          isLoading = false;
        });
      }
    } catch (e) {
      print('Error loading events: $e');
      if (mounted) {
        setState(() {
          events = [];
          isLoading = false;
        });
      }
    }
  }

  Future<void> _continueEvent(dynamic event) async {
    final success = await EventService.continueEvent(event);
    if (!success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open browser')),
      );
    }
  }

  Future<void> _deleteEvent(int index) async {
    final event = events[index];
    
    await DeleteEventDialog.show(
      context,
      event: event,
      onConfirmDelete: () async {
        setState(() {
          events.removeAt(index);
        });
        await EventService.saveToLocal(events);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Event deleted successfully')),
          );
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 600;
    final padding = isMobile ? 12.0 : 24.0;
    
    return Container(
      color: Colors.grey.shade50,
      child: Column(
        children: [
          // Header
          const SetupHeader(),
          // Content
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : events.isEmpty
                    ? const EmptyEventsView()
                    : Padding(
                        padding: EdgeInsets.all(padding),
                        child: ListView.builder(
                          itemCount: events.length,
                          itemBuilder: (context, index) {
                            final event = events[index];
                            final isExpanded = expandedEvents[index] ?? false;

                            return EventCard(
                              event: event,
                              isExpanded: isExpanded,
                              onToggle: () {
                                setState(() {
                                  expandedEvents[index] = !isExpanded;
                                });
                              },
                              onContinue: () => _continueEvent(event),
                              onDelete: () => _deleteEvent(index),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
