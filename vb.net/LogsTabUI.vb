Imports System.Windows.Forms
Imports System.Drawing

Public Class LogsTabUI
    Public Shared Function CreateTab(tabPage As TabPage) As TextBox
        Dim panel = New Panel()
        panel.Dock = DockStyle.Fill
        panel.BackColor = UITheme.BgPrimary
        panel.Padding = New Padding(20)

        Dim headerLbl = New Label()
        headerLbl.Text = "Application Logs"
        headerLbl.Font = UITheme.FontLarge
        headerLbl.ForeColor = UITheme.TextPrimary
        headerLbl.Location = New Point(0, 0)
        headerLbl.AutoSize = True
        panel.Controls.Add(headerLbl)

        Dim logsTextBox = New TextBox()
        logsTextBox.Location = New Point(0, 50)
        logsTextBox.Size = New Size(panel.Width - 40, panel.Height - 70)
        logsTextBox.BackColor = UITheme.BgSecondary
        logsTextBox.ForeColor = UITheme.TextTertiary
        logsTextBox.ReadOnly = True
        logsTextBox.Multiline = True
        logsTextBox.ScrollBars = ScrollBars.Vertical
        logsTextBox.Font = UITheme.FontMono
        logsTextBox.Anchor = AnchorStyles.Top Or AnchorStyles.Left Or AnchorStyles.Right Or AnchorStyles.Bottom
        panel.Controls.Add(logsTextBox)

        tabPage.Controls.Add(panel)
        Return logsTextBox
    End Function
End Class
