import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:convert';
import 'dart:io';
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
  String? _localIp;
  bool _lanMode = false;

  @override
  void initState() {
    super.initState();
    _loadConfig();
    _getLocalIp();
    _loadEvents();
    _refreshTimer = Timer.periodic(const Duration(seconds: 5), (_) => _loadEvents());
  }

  @override
  void dispose() {
    _refreshTimer.cancel();
    super.dispose();
  }

  Future<void> _loadConfig() async {
    try {
      final configFile = File('${Directory.current.path}/database.json');
      if (await configFile.exists()) {
        final content = await configFile.readAsString();
        final json = jsonDecode(content);
        if (mounted) setState(() => _lanMode = json['lanMode'] ?? false);
      }
    } catch (_) {}
  }

  Future<void> _getLocalIp() async {
    try {
      final interfaces = await NetworkInterface.list(type: InternetAddressType.IPv4, includeLoopback: false);
      for (var interface in interfaces) {
        for (var addr in interface.addresses) {
          final ip = addr.address;
          if (!ip.startsWith('127.') && !ip.startsWith('169.254.')) {
            if (mounted) setState(() => _localIp = ip);
            return;
          }
        }
      }
    } catch (_) {}
  }

  String get _baseUrl {
    if (_lanMode && _localIp != null) {
      return 'http://$_localIp:8000';
    }
    return 'http://localhost:8000';
  }

  Future<void> _loadEvents() async {
    try {
      final response = await http.get(Uri.parse('$_baseUrl/api/events')).timeout(const Duration(seconds: 3));
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
      // Use new URL format: /admin?event_id=X
      final url = Uri.parse('$_baseUrl/admin?event_id=$id');
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
