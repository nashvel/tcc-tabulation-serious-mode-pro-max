import 'package:flutter/material.dart';

/// Minimalist color palette - white and black only
class AppColors {
  static const Color background = Color(0xFFFFFFFF);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color text = Color(0xFF000000);
  static const Color textMuted = Color(0xFF666666);
  static const Color border = Color(0xFFE5E5E5);
  static const Color hover = Color(0xFFF5F5F5);
  static const Color selected = Color(0xFFF0F0F0);
  static const Color disabled = Color(0xFFCCCCCC);
}

/// Minimalist text styles
class AppTextStyles {
  static const TextStyle heading = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    color: AppColors.text,
    letterSpacing: -0.2,
  );

  static const TextStyle body = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.text,
  );

  static const TextStyle small = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w400,
    color: AppColors.textMuted,
  );

  static const TextStyle mono = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w400,
    color: AppColors.textMuted,
    fontFamily: 'Consolas',
  );

  static const TextStyle button = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w500,
    color: AppColors.text,
  );
}

/// Minimalist spacing
class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
}

/// Minimalist borders
class AppBorders {
  static final BorderSide thin = BorderSide(
    color: AppColors.border,
    width: 1,
  );

  static final Border all = Border.all(
    color: AppColors.border,
    width: 1,
  );

  static final BorderRadius radius = BorderRadius.circular(4);
}

/// App theme data
class AppTheme {
  static ThemeData get light => ThemeData(
    scaffoldBackgroundColor: AppColors.background,
    colorScheme: const ColorScheme.light(
      surface: AppColors.surface,
      onSurface: AppColors.text,
    ),
    dividerColor: AppColors.border,
    textTheme: const TextTheme(
      bodyMedium: AppTextStyles.body,
      bodySmall: AppTextStyles.small,
      titleMedium: AppTextStyles.heading,
    ),
  );
}
