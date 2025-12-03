import 'package:flutter/material.dart';
import 'package:interactive_chart/interactive_chart.dart';
import 'dart:async';
import 'dart:io';

class DashboardChart extends StatefulWidget {
  final bool isMobile;
  final double padding;

  const DashboardChart({
    super.key,
    required this.isMobile,
    required this.padding,
    // Keep these for backwards compatibility but won't use them
    int totalEvents = 0,
    int activeEvents = 0,
    int completedEvents = 0,
  });

  @override
  State<DashboardChart> createState() => _DashboardChartState();
}

class _DashboardChartState extends State<DashboardChart> {
  double cpuUsage = 0;
  double ramUsage = 0;
  double ramTotal = 0;
  double ramUsed = 0;
  Timer? _timer;
  List<CandleData> cpuChartData = [];
  List<double> cpuValues = []; // Track all values for min/max

  @override
  void initState() {
    super.initState();
    _getSystemStats();
    // Update every 2 seconds
    _timer = Timer.periodic(const Duration(seconds: 2), (_) {
      _getSystemStats();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _getSystemStats() async {
    if (!Platform.isWindows || !mounted) return;

    try {
      // Get CPU usage
      final cpuResult = await Process.run('wmic', ['cpu', 'get', 'loadpercentage']);
      final cpuLines = cpuResult.stdout.toString().trim().split('\n');
      if (cpuLines.length > 1) {
        final cpuValue = cpuLines[1].trim();
        if (cpuValue.isNotEmpty && mounted) {
          final newCpuUsage = double.tryParse(cpuValue) ?? 0;
          
          setState(() {
            cpuUsage = newCpuUsage;
            cpuValues.add(newCpuUsage);
            
            // Keep last 30 values
            if (cpuValues.length > 30) {
              cpuValues.removeAt(0);
            }
            
            // Create candlestick every 3 data points (6 seconds)
            if (cpuValues.length % 3 == 0) {
              // Get the last 3 values for this candle
              final startIdx = cpuValues.length - 3;
              final candleValues = cpuValues.sublist(startIdx);
              
              final open = candleValues[0];
              final close = candleValues[2];
              final high = candleValues.reduce((a, b) => a > b ? a : b);
              final low = candleValues.reduce((a, b) => a < b ? a : b);
              
              // Keep last 10 candles
              if (cpuChartData.length >= 10) {
                cpuChartData.removeAt(0);
              }
              
              cpuChartData.add(CandleData(
                timestamp: DateTime.now().millisecondsSinceEpoch,
                open: open,
                high: high,
                low: low,
                close: close,
                volume: (high + low) / 2, // Average for volume
              ));
            }
          });
        }
      }

      // Get RAM usage
      final ramResult = await Process.run('wmic', ['OS', 'get', 'FreePhysicalMemory,TotalVisibleMemorySize', '/Value']);
      final ramOutput = ramResult.stdout.toString();
      
      final freeMatch = RegExp(r'FreePhysicalMemory=(\d+)').firstMatch(ramOutput);
      final totalMatch = RegExp(r'TotalVisibleMemorySize=(\d+)').firstMatch(ramOutput);
      
      if (freeMatch != null && totalMatch != null && mounted) {
        final freeKB = double.parse(freeMatch.group(1)!);
        final totalKB = double.parse(totalMatch.group(1)!);
        final usedKB = totalKB - freeKB;
        
        setState(() {
          ramTotal = totalKB / 1024 / 1024; // Convert to GB
          ramUsed = usedKB / 1024 / 1024; // Convert to GB
          ramUsage = (usedKB / totalKB) * 100;
        });
      }
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
          Row(
            children: [
              Icon(
                Icons.monitor_heart,
                color: Colors.purple.shade700,
                size: widget.isMobile ? 16 : 20,
              ),
              const SizedBox(width: 8),
              Text(
                'System Status',
                style: TextStyle(
                  fontSize: widget.isMobile ? 14 : 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          SizedBox(height: widget.padding),
          // CPU Candlestick Chart
          Container(
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade200),
            ),
            padding: EdgeInsets.all(widget.padding),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'CPU Usage Chart',
                  style: TextStyle(
                    fontSize: widget.isMobile ? 12 : 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey.shade700,
                  ),
                ),
                SizedBox(height: widget.padding),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: SizedBox(
                    height: widget.isMobile ? 180 : 250,
                    width: double.infinity,
                    child: cpuChartData.length < 3
                        ? Center(
                            child: Text(
                              'Loading chart data... (${cpuChartData.length}/3)',
                              style: TextStyle(color: Colors.grey.shade600),
                            ),
                          )
                        : SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: SizedBox(
                              width: cpuChartData.length * 35.0 > 300
                                  ? cpuChartData.length * 35.0
                                  : 300,
                              height: widget.isMobile ? 180 : 250,
                              child: InteractiveChart(
                                candles: cpuChartData,
                              ),
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: widget.padding),
          Row(
            children: [
              // CPU Usage Card
              Expanded(
                child: _buildStatusCard(
                  title: 'CPU Usage',
                  value: cpuUsage,
                  icon: Icons.memory,
                  color: _getCpuColor(cpuUsage),
                  subtitle: '${cpuUsage.toStringAsFixed(0)}%',
                ),
              ),
              SizedBox(width: widget.padding),
              // RAM Usage Card
              Expanded(
                child: _buildStatusCard(
                  title: 'RAM Usage',
                  value: ramUsage,
                  icon: Icons.storage,
                  color: _getRamColor(ramUsage),
                  subtitle: '${ramUsed.toStringAsFixed(1)} / ${ramTotal.toStringAsFixed(1)} GB',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _getCpuColor(double usage) {
    if (usage < 50) return Colors.green;
    if (usage < 80) return Colors.orange;
    return Colors.red;
  }

  Color _getRamColor(double usage) {
    if (usage < 60) return Colors.blue;
    if (usage < 85) return Colors.orange;
    return Colors.red;
  }

  Widget _buildStatusCard({
    required String title,
    required double value,
    required IconData icon,
    required Color color,
    required String subtitle,
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
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: widget.isMobile ? 12 : 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey.shade700,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: widget.padding),
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: value / 100,
              backgroundColor: Colors.grey.shade200,
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: widget.isMobile ? 8 : 12,
            ),
          ),
          SizedBox(height: widget.padding * 0.5),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: widget.isMobile ? 11 : 13,
                    color: Colors.grey.shade600,
                    fontWeight: FontWeight.w500,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${value.toStringAsFixed(0)}%',
                  style: TextStyle(
                    fontSize: widget.isMobile ? 10 : 12,
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
