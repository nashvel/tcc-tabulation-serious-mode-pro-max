import 'package:flutter/material.dart';
import '../create_event_screen.dart';
import '../../utils/responsive.dart';
import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;

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
        final gridColumns = isMobile ? 1 : (isTablet ? 2 : 3);
        final fontSize = isMobile ? 24.0 : (isTablet ? 26.0 : 28.0);

        return Container(
          color: Colors.grey.shade50,
          child: Column(
            children: [
              Container(
                color: Colors.white,
                padding: EdgeInsets.all(padding),
                child: Row(
                  children: [
                    Text(
                      'Dashboard',
                      style: TextStyle(
                        fontSize: fontSize,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Spacer(),
                    if (!isMobile)
                      ElevatedButton.icon(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => const CreateEventScreen(),
                            ),
                          ).then((_) => _loadDashboardData());
                        },
                        icon: const Icon(Icons.add),
                        label: const Text('New Event'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                          padding: EdgeInsets.symmetric(
                            horizontal: padding * 2,
                            vertical: padding,
                          ),
                        ),
                      )
                    else
                      FloatingActionButton.small(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => const CreateEventScreen(),
                            ),
                          ).then((_) => _loadDashboardData());
                        },
                        child: const Icon(Icons.add),
                      ),
                  ],
                ),
              ),
              // Content
              Expanded(
                child: isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : Padding(
                        padding: EdgeInsets.all(padding),
                        child: ListView(
                          children: [
                            // Stats Cards
                            GridView.count(
                              crossAxisCount: gridColumns,
                              crossAxisSpacing: padding,
                              mainAxisSpacing: padding,
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              children: [
                                _buildStatCard('Total Events', totalEvents.toString(), Colors.blue),
                                _buildStatCard('Active Events', activeEvents.toString(), Colors.green),
                                _buildStatCard('Completed', completedEvents.toString(), Colors.orange),
                              ],
                            ),
                            SizedBox(height: padding * 1.5),
                            // Chart Section
                            Container(
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
                              padding: EdgeInsets.all(padding),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Event Status Overview',
                                    style: TextStyle(
                                      fontSize: isMobile ? 14 : 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  SizedBox(height: padding),
                                  _buildChart(),
                                ],
                              ),
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

  Widget _buildStatCard(String title, String value, Color color) {
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
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.event,
              color: color,
              size: 32,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            value,
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChart() {
    final maxValue = [totalEvents, activeEvents, completedEvents].reduce((a, b) => a > b ? a : b).toDouble();
    final chartHeight = 200.0;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _buildBarChart('Total', totalEvents, Colors.blue, maxValue, chartHeight),
        _buildBarChart('Active', activeEvents, Colors.green, maxValue, chartHeight),
        _buildBarChart('Completed', completedEvents, Colors.orange, maxValue, chartHeight),
      ],
    );
  }

  Widget _buildBarChart(String label, int value, Color color, double maxValue, double chartHeight) {
    final barHeight = maxValue > 0 ? (value / maxValue) * chartHeight : 0.0;

    return Column(
      children: [
        Container(
          width: 60,
          height: chartHeight,
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Stack(
            alignment: Alignment.bottomCenter,
            children: [
              Container(
                width: 60,
                height: barHeight,
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(8),
                    topRight: Radius.circular(8),
                  ),
                ),
              ),
              Positioned(
                top: 8,
                child: Text(
                  value.toString(),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.grey.shade700,
          ),
        ),
      ],
    );
  }
}
