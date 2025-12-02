# TCC Tabulation Desktop App - Setup Guide

## Overview
This is a Flutter desktop application for the TCC Tabulation System. It serves as an app starter that can:
- Launch the development server (`npm run dev`)
- Create events
- Admin login
- Manage tabulation events

## Prerequisites

### Required Software
1. **Flutter SDK** - [Download here](https://flutter.dev/docs/get-started/install)
2. **Visual Studio Code** or **Android Studio** with Flutter extension
3. **Git** (optional, for version control)

### System Requirements
- Windows 10 or later
- At least 2GB RAM
- 500MB free disk space

## Installation

### 1. Setup Flutter
```bash
# Add Flutter to your PATH
# On Windows, add: C:\path\to\flutter\bin to your system PATH

# Verify Flutter installation
flutter doctor
```

### 2. Clone/Navigate to Project
```bash
cd c:\Users\user\OneDrive\Desktop\mini-capstone\tabulation-systemv2\desktop\tabulation_desktop
```

### 3. Get Dependencies
```bash
flutter pub get
```

## Running the App

### Development Mode
```bash
flutter run -d windows
```

### Build for Release
```bash
flutter build windows --release
```

## Features

### Login Screen
- Email: `admin@tcc.com`
- Password: `password123`
- Modern gradient UI matching admin interface

### Home Screen
- **Dashboard**: View statistics and quick actions
- **Events**: List and manage events
- **Settings**: Application settings
- **Help**: Getting started guide

### Sidebar Navigation
- Icon-only navigation for clean interface
- Tooltip on hover for accessibility
- Quick logout button

### Create Event
- Event name
- Category selection
- Event date picker
- Location
- Description
- Form validation

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── screens/
│   ├── login_screen.dart     # Admin login
│   ├── home_screen.dart      # Main dashboard
│   └── create_event_screen.dart  # Event creation
```

## API Integration (Future)

The app is ready to integrate with your Laravel backend:

```dart
// Example API call
import 'package:http/http.dart' as http;

Future<void> loginUser(String email, String password) async {
  final response = await http.post(
    Uri.parse('http://localhost:8000/api/login'),
    body: {
      'email': email,
      'password': password,
    },
  );
  
  if (response.statusCode == 200) {
    // Handle success
  } else {
    // Handle error
  }
}
```

## Development Tips

### Hot Reload
Press `r` in terminal to hot reload during development

### Hot Restart
Press `R` in terminal to restart the app

### Debug Mode
```bash
flutter run -d windows --debug
```

### Profile Mode
```bash
flutter run -d windows --profile
```

## Troubleshooting

### Flutter not found
- Add Flutter to PATH
- Run `flutter doctor` to check installation

### Build errors
```bash
# Clean build
flutter clean
flutter pub get
flutter run -d windows
```

### Port already in use
- Change the port in your backend configuration
- Or kill the process using the port

## Next Steps

1. **Connect to Backend**: Update API endpoints in the app
2. **Add Authentication**: Implement JWT token storage
3. **Add Event Management**: Connect to your event API
4. **Add Real-time Updates**: Implement WebSocket for live updates
5. **Package for Distribution**: Build release APK/executable

## Support

For issues or questions, refer to:
- [Flutter Documentation](https://flutter.dev/docs)
- [Dart Documentation](https://dart.dev/guides)
- Your project documentation

---

**Last Updated**: December 2, 2025
**Version**: 1.0.0
