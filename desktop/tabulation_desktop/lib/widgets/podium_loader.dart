import 'package:flutter/material.dart';
import 'dart:math' as math;

/// Animated "PODIUM" text loader with black stroke animation
class PodiumLoader extends StatefulWidget {
  final double size;

  const PodiumLoader({super.key, this.size = 64});

  @override
  State<PodiumLoader> createState() => _PodiumLoaderState();
}

class _PodiumLoaderState extends State<PodiumLoader>
    with TickerProviderStateMixin {
  late AnimationController _dashController;
  late AnimationController _spinController;
  late Animation<double> _dashAnimation;

  @override
  void initState() {
    super.initState();

    // Dash animation (2s cycle)
    _dashController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    )..repeat();

    // Spin animation (8s cycle)
    _spinController = AnimationController(
      duration: const Duration(milliseconds: 8000),
      vsync: this,
    )..repeat();

    _dashAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _dashController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _dashController.dispose();
    _spinController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const color = Color(0xFF000000); // Black only
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildLetter('P', color),
        SizedBox(width: widget.size * 0.08),
        _buildCircle(color),
        SizedBox(width: widget.size * 0.08),
        _buildLetter('D', color),
        SizedBox(width: widget.size * 0.08),
        _buildLetter('I', color),
        SizedBox(width: widget.size * 0.08),
        _buildLetter('U', color),
        SizedBox(width: widget.size * 0.08),
        _buildLetter('M', color),
      ],
    );
  }

  Widget _buildLetter(String letter, Color color) {
    return AnimatedBuilder(
      animation: _dashController,
      builder: (context, child) {
        return CustomPaint(
          size: Size(widget.size, widget.size),
          painter: _LetterPainter(
            letter: letter,
            color: color,
            dashProgress: _dashAnimation.value,
          ),
        );
      },
    );
  }

  Widget _buildCircle(Color color) {
    return AnimatedBuilder(
      animation: Listenable.merge([_dashController, _spinController]),
      builder: (context, child) {
        // Calculate spin rotation based on 8s cycle with steps
        final spinProgress = _spinController.value;
        double rotation = 0;
        if (spinProgress < 0.125) {
          rotation = 0;
        } else if (spinProgress < 0.25) {
          rotation = _easeInOut((spinProgress - 0.125) / 0.125) * 270;
        } else if (spinProgress < 0.375) {
          rotation = 270;
        } else if (spinProgress < 0.5) {
          rotation = 270 + _easeInOut((spinProgress - 0.375) / 0.125) * 270;
        } else if (spinProgress < 0.625) {
          rotation = 540;
        } else if (spinProgress < 0.75) {
          rotation = 540 + _easeInOut((spinProgress - 0.625) / 0.125) * 270;
        } else if (spinProgress < 0.875) {
          rotation = 810;
        } else {
          rotation = 810 + _easeInOut((spinProgress - 0.875) / 0.125) * 270;
        }

        return Transform.rotate(
          angle: rotation * math.pi / 180,
          child: CustomPaint(
            size: Size(widget.size, widget.size),
            painter: _CirclePainter(
              color: color,
              dashProgress: _dashAnimation.value,
            ),
          ),
        );
      },
    );
  }

  double _easeInOut(double t) {
    return t < 0.5 ? 2 * t * t : 1 - math.pow(-2 * t + 2, 2) / 2;
  }
}

class _LetterPainter extends CustomPainter {
  final String letter;
  final Color color;
  final double dashProgress;

  _LetterPainter({
    required this.letter,
    required this.color,
    required this.dashProgress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.12
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..color = color;

    final path = _getLetterPath(letter, size);
    canvas.drawPath(path, paint);
  }

  Path _getLetterPath(String letter, Size size) {
    final path = Path();
    final w = size.width;
    final h = size.height;
    final padding = w * 0.15;

    switch (letter) {
      case 'P':
        path.moveTo(padding, h - padding);
        path.lineTo(padding, padding);
        path.lineTo(w * 0.6, padding);
        path.quadraticBezierTo(w - padding, padding, w - padding, h * 0.35);
        path.quadraticBezierTo(w - padding, h * 0.55, w * 0.6, h * 0.55);
        path.lineTo(padding, h * 0.55);
        break;
      case 'D':
        path.moveTo(padding, h - padding);
        path.lineTo(padding, padding);
        path.lineTo(w * 0.5, padding);
        path.quadraticBezierTo(w - padding, padding, w - padding, h * 0.5);
        path.quadraticBezierTo(w - padding, h - padding, w * 0.5, h - padding);
        path.lineTo(padding, h - padding);
        break;
      case 'I':
        path.moveTo(w * 0.3, padding);
        path.lineTo(w * 0.7, padding);
        path.moveTo(w * 0.5, padding);
        path.lineTo(w * 0.5, h - padding);
        path.moveTo(w * 0.3, h - padding);
        path.lineTo(w * 0.7, h - padding);
        break;
      case 'U':
        path.moveTo(padding, padding);
        path.lineTo(padding, h * 0.6);
        path.quadraticBezierTo(padding, h - padding, w * 0.5, h - padding);
        path.quadraticBezierTo(w - padding, h - padding, w - padding, h * 0.6);
        path.lineTo(w - padding, padding);
        break;
      case 'M':
        path.moveTo(padding, h - padding);
        path.lineTo(padding, padding);
        path.lineTo(w * 0.5, h * 0.5);
        path.lineTo(w - padding, padding);
        path.lineTo(w - padding, h - padding);
        break;
    }

    return path;
  }

  @override
  bool shouldRepaint(covariant _LetterPainter oldDelegate) {
    return oldDelegate.dashProgress != dashProgress;
  }
}

class _CirclePainter extends CustomPainter {
  final Color color;
  final double dashProgress;

  _CirclePainter({
    required this.color,
    required this.dashProgress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width * 0.35;

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.15
      ..strokeCap = StrokeCap.round
      ..color = color;

    // Calculate sweep angle based on animation
    double startAngle, sweepAngle;
    if (dashProgress < 0.5) {
      final t = dashProgress * 2;
      startAngle = -math.pi / 2 + t * math.pi * 2;
      sweepAngle = math.pi * 1.5 * (1 - t) + math.pi * 2 * t;
    } else {
      final t = (dashProgress - 0.5) * 2;
      startAngle = -math.pi / 2;
      sweepAngle = math.pi * 1.5 + t * math.pi * 0.5;
    }

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepAngle.clamp(0.1, math.pi * 2),
      false,
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant _CirclePainter oldDelegate) {
    return oldDelegate.dashProgress != dashProgress;
  }
}
