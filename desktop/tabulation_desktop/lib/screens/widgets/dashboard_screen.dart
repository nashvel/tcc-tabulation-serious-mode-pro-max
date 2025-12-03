import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;

// Dashboard widgets
import 'dashboard/dashboard_header.dart';
import 'dashboard/stats_row.dart';
import 'dashboard/dashboard_chart.dart';
import 'dashboard/server_info_panel.dart';

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

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
    // Auto-refresh every 2 seconds
    _refreshTimer = Timer.periodic(const Duration(seconds: 2), (_) {
      _loadDashboardData();
    });
  }

  @override
  void dispose() {
    _refreshTimer.cancel();
    super.dispose();
  }

  Future<void> _loadDashboardData() async {
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
      print('Error loading dashboard data: $e');
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
            totalEvents = data.length;
            activeEvents = data.where((e) => e['status'] == 'Active').length;
            completedEvents = data.where((e) => e['status'] == 'Completed').length;
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
        if (mounted) {
          setState(() {
            totalEvents = 0;
            activeEvents = 0;
            completedEvents = 0;
            events = [];
            isLoading = false;
          });
        }
      }
    } catch (e) {
      print('Error loading from local: $e');
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isMobile = constraints.maxWidth < 600;
        final isTablet = constraints.maxWidth >= 600 && constraints.maxWidth < 1200;
        final padding = isMobile ? 12.0 : (isTablet ? 16.0 : 24.0);
        final fontSize = isMobile ? 24.0 : (isTablet ? 26.0 : 28.0);

        return Container(
          color: Colors.grey.shade50,
          child: Column(
            children: [
              // Header
              DashboardHeader(
                isMobile: isMobile,
                padding: padding,
                fontSize: fontSize,
                onEventCreated: _loadDashboardData,
              ),
              // Content
              Expanded(
                child: isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : Padding(
                        padding: EdgeInsets.all(padding),
                        child: ListView(
                          children: [
                            // Stats Cards - Only show on tablet and desktop
                            if (!isMobile) ...[
                              StatsRow(
                                totalEvents: totalEvents,
                                activeEvents: activeEvents,
                                completedEvents: completedEvents,
                                spacing: padding,
                              ),
                              SizedBox(height: padding * 1.5),
                            ],
                            // System Status
                            DashboardChart(
                              isMobile: isMobile,
                              padding: padding,
                            ),
                            SizedBox(height: padding * 1.5),
                            // Server Info Panel
                            ServerInfoPanel(
                              isMobile: isMobile,
                              padding: padding,
                            ),
                          ],
                        ),
                      ),
              ),
            ],
          ),
        );
      },
    );
  }
}
