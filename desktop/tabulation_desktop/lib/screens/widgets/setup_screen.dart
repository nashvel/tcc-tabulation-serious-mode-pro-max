import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../../theme/app_theme.dart';
import '../../widgets/podium_loader.dart';

class SetupScreen extends StatefulWidget {
  const SetupScreen({super.key});

  @override
  State<SetupScreen> createState() => _SetupScreenState();
}

class _SetupScreenState extends State<SetupScreen> {
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

  Future<void> _openEvent(dynamic event) async {
    final id = event['id'] ?? event['unique_id'];
    if (id != null) {
      final url = Uri.parse('http://localhost:8000/admin/events/$id');
      if (await canLaunchUrl(url)) await launchUrl(url);
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
          Text('Event Setup', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: AppSpacing.sm),
          Text('Configure your events in the browser', style: AppTextStyles.small),
          const SizedBox(height: AppSpacing.lg),
          Container(height: 1, color: AppColors.border),
          // Events list
          Expanded(
            child: isLoading
                ? const Center(child: PodiumLoader(size: 24))
                : events.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.event_outlined, size: 32, color: AppColors.disabled),
                            const SizedBox(height: AppSpacing.md),
                            Text('No events to configure', style: AppTextStyles.body.copyWith(color: AppColors.textMuted)),
                            const SizedBox(height: AppSpacing.sm),
                            Text('Create an event from the Dashboard first', style: AppTextStyles.small),
                          ],
                        ),
                      )
                    : ListView.separated(
                        itemCount: events.length,
                        separatorBuilder: (_, __) => Container(height: 1, color: AppColors.border),
                        itemBuilder: (context, index) {
                          final event = events[index];
                          final status = event['status'] ?? 'Draft';
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(event['title'] ?? event['name'] ?? 'Untitled', style: AppTextStyles.body),
                                      Row(
                                        children: [
                                          Text(status, style: AppTextStyles.small),
                                          if (event['event_type'] != null) ...[
                                            Text(' • ', style: AppTextStyles.small),
                                            Text(event['event_type'], style: AppTextStyles.small),
                                          ],
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () => _openEvent(event),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
                                    decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(Icons.open_in_new, size: 12, color: AppColors.text),
                                        const SizedBox(width: 4),
                                        Text('Open', style: AppTextStyles.button.copyWith(fontSize: 11)),
                                      ],
                                    ),
                                  ),
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
