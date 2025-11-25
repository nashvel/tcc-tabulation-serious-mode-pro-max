Imports System.Drawing

Public Class UITheme
    ' Modern gradient colors
    Public Shared ReadOnly BgPrimary As Color = Color.FromArgb(10, 15, 25)
    Public Shared ReadOnly BgSecondary As Color = Color.FromArgb(20, 28, 45)
    Public Shared ReadOnly BgTertiary As Color = Color.FromArgb(30, 40, 60)
    Public Shared ReadOnly BgHover As Color = Color.FromArgb(40, 55, 80)
    
    Public Shared ReadOnly TextPrimary As Color = Color.FromArgb(240, 245, 255)
    Public Shared ReadOnly TextSecondary As Color = Color.FromArgb(160, 175, 200)
    Public Shared ReadOnly TextTertiary As Color = Color.FromArgb(120, 140, 170)
    
    ' Modern vibrant colors
    Public Shared ReadOnly ColorSuccess As Color = Color.FromArgb(16, 185, 129)
    Public Shared ReadOnly ColorDanger As Color = Color.FromArgb(239, 68, 68)
    Public Shared ReadOnly ColorInfo As Color = Color.FromArgb(59, 130, 246)
    Public Shared ReadOnly ColorWarning As Color = Color.FromArgb(245, 158, 11)
    Public Shared ReadOnly ColorPurple As Color = Color.FromArgb(139, 92, 246)
    Public Shared ReadOnly ColorCyan As Color = Color.FromArgb(34, 211, 238)
    
    ' Fonts
    Public Shared ReadOnly FontLarge As Font = New Font("Segoe UI", 24, FontStyle.Bold)
    Public Shared ReadOnly FontMedium As Font = New Font("Segoe UI", 16, FontStyle.Bold)
    Public Shared ReadOnly FontNormal As Font = New Font("Segoe UI", 12)
    Public Shared ReadOnly FontSmall As Font = New Font("Segoe UI", 11)
    Public Shared ReadOnly FontMono As Font = New Font("Courier New", 10)
End Class
