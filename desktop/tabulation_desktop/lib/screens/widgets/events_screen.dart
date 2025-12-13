import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import '../../theme/app_theme.dart';
import '../../widgets/podium_loader.dart';
import '../create_event_screen.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({super.key});

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  List<dynamic> events = [];
  bool isLoading = true;
  late Timer _refreshTimer;

  @override
  void initState() {
    super.initState();
    _loadEvents();
    _refreshTimer = Timer.periodic(const Duration(seconds: 5), (_) => _loadEvents());
  }

  @override
  void dispose() {
    _refreshTimer.cancel();
    super.dispose();
  }

  Future<void> _loadEvents() async {
    try {
      final response = await http.get(Uri.parse('http://localhost:8000/api/events')).timeout(const Duration(seconds: 3));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is List && mounted) setState(() { events = data; isLoading = false; });
      }
    } catch (_) {
      if (mounted) setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.background,
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row
          Row(
            children: [
              Text('All Events', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
              const SizedBox(width: AppSpacing.sm),
              Text('(${events.length})', style: AppTextStyles.small),
              const Spacer(),
              GestureDetector(
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const CreateEventScreen()),
                ).then((_) => _loadEvents()),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
                  decoration: BoxDecoration(color: AppColors.text, borderRadius: AppBorders.radius),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.add, size: 14, color: Colors.white),
                      const SizedBox(width: 4),
                      Text('New', style: AppTextStyles.button.copyWith(color: Colors.white, fontSize: 11)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Container(height: 1, color: AppColors.border),
          // Events list
          Expanded(
            child: isLoading
                ? const Center(child: PodiumLoader(size: 24))
                : events.isEmpty
                    ? Center(child: Text('No events', style: AppTextStyles.small))
                    : ListView.separated(
                        itemCount: events.length,
                        separatorBuilder: (_, __) => Container(height: 1, color: AppColors.border),
                        itemBuilder: (context, index) {
                          final event = events[index];
                          final status = event['status'] ?? 'Draft';
                          final isActive = status == 'Active';
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
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
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(event['title'] ?? event['name'] ?? 'Untitled', style: AppTextStyles.body),
                                      if (event['event_type'] != null)
                                        Text(event['event_type'], style: AppTextStyles.small),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 2),
                                  decoration: BoxDecoration(
                                    border: AppBorders.all,
                                    borderRadius: AppBorders.radius,
                                  ),
                                  child: Text(status, style: AppTextStyles.small.copyWith(fontSize: 10)),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
