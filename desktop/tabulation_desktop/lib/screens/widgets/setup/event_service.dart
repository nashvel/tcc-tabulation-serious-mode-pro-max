import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:url_launcher/url_launcher.dart';

class EventService {
  static const String apiBaseUrl = 'http://localhost:8000/api';
  static const String frontendUrl = 'http://localhost:5173';

  /// Fetch events from backend API
  static Future<List<dynamic>?> fetchFromBackend() async {
    try {
      final response = await http.get(
        Uri.parse('$apiBaseUrl/events'),
      ).timeout(const Duration(seconds: 3));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is List) {
          return data;
        }
      }
    } catch (e) {
      print('Backend fetch failed: $e');
    }
    return null;
  }

  /// Load events from local storage
  static Future<List<dynamic>> loadFromLocal() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = File('${directory.path}/events.json');

      if (await file.exists()) {
        final contents = await file.readAsString();
        final data = jsonDecode(contents);
        return data is List ? data : [];
      }
    } catch (e) {
      print('Error loading from local: $e');
    }
    return [];
  }

  /// Save events to local storage
  static Future<void> saveToLocal(List<dynamic> events) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = File('${directory.path}/events.json');
      await file.writeAsString(jsonEncode(events));
    } catch (e) {
      print('Error saving to local: $e');
    }
  }

  /// Save continuing event and open admin panel
  static Future<bool> continueEvent(dynamic event) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = File('${directory.path}/continuingEvent.json');
      await file.writeAsString(jsonEncode(event));

      final eventTitle = event['title'] ?? 'Event';
      final url = Uri.parse('$frontendUrl/admin?event_title=${Uri.encodeComponent(eventTitle)}');
      
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
        return true;
      }
    } catch (e) {
      print('Error continuing event: $e');
    }
    return false;
  }

  /// Delete event from backend
  static Future<bool> deleteFromBackend(int eventId) async {
    try {
      final response = await http.delete(
        Uri.parse('$apiBaseUrl/events/$eventId'),
      ).timeout(const Duration(seconds: 3));
      return response.statusCode == 200;
    } catch (e) {
      print('Error deleting from backend: $e');
      return false;
    }
  }
}
