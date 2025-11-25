Imports System.Windows.Forms
Imports System.Drawing

Public Class EventTabUI
    Public Shared Function CreateTab(tabPage As TabPage,
                                    onCreateEvent As Action,
                                    onDeleteEvent As Action,
                                    onContinueEvent As Action) As (TitleTxt As TextBox, YearTxt As TextBox, JudgesTxt As TextBox, EventList As ListBox)
        
        Dim panel = New Panel()
        panel.Dock = DockStyle.Fill
        panel.BackColor = UITheme.BgPrimary
        panel.Padding = New Padding(30)
        panel.AutoScroll = True

        ' Header
        Dim headerLbl = New Label()
        headerLbl.Text = "Event Management"
        headerLbl.Font = UITheme.FontLarge
        headerLbl.ForeColor = UITheme.TextPrimary
        headerLbl.Location = New Point(0, 0)
        headerLbl.AutoSize = True
        panel.Controls.Add(headerLbl)

        ' Form section
        Dim formLbl = New Label()
        formLbl.Text = "Create New Event"
        formLbl.Font = UITheme.FontMedium
        formLbl.ForeColor = UITheme.TextPrimary
        formLbl.Location = New Point(0, 50)
        formLbl.AutoSize = True
        panel.Controls.Add(formLbl)

        ' Input fields
        Dim y = 90
        Dim titleTxt = CreateInputField(panel, "Event Title:", 0, y)
        y += 70

        Dim yearTxt = CreateInputField(panel, "Year:", 0, y)
        yearTxt.Text = DateTime.Now.Year.ToString()
        y += 70

        Dim judgesTxt = CreateInputField(panel, "Number of Judges:", 0, y)
        y += 70

        Dim createBtn = New Button()
        createBtn.Text = "✓ Create Event"
        createBtn.Location = New Point(0, y)
        createBtn.Size = New Size(400, 45)
        createBtn.BackColor = UITheme.ColorSuccess
        createBtn.ForeColor = Color.White
        createBtn.FlatStyle = FlatStyle.Flat
        createBtn.Font = UITheme.FontNormal
        AddHandler createBtn.Click, Sub(s, e) onCreateEvent()
        panel.Controls.Add(createBtn)

        ' Events list section
        Dim listLbl = New Label()
        listLbl.Text = "Existing Events"
        listLbl.Font = UITheme.FontMedium
        listLbl.ForeColor = UITheme.TextPrimary
        listLbl.Location = New Point(500, 50)
        listLbl.AutoSize = True
        panel.Controls.Add(listLbl)

        Dim eventList = New ListBox()
        eventList.Location = New Point(500, 90)
        eventList.Size = New Size(700, 300)
        eventList.BackColor = UITheme.BgSecondary
        eventList.ForeColor = UITheme.TextPrimary
        eventList.Font = UITheme.FontSmall
        panel.Controls.Add(eventList)

        ' Action buttons
        Dim deleteBtn = New Button()
        deleteBtn.Text = "🗑️ Delete"
        deleteBtn.Location = New Point(500, 410)
        deleteBtn.Size = New Size(150, 40)
        deleteBtn.BackColor = UITheme.ColorDanger
        deleteBtn.ForeColor = Color.White
        deleteBtn.FlatStyle = FlatStyle.Flat
        deleteBtn.Font = UITheme.FontSmall
        AddHandler deleteBtn.Click, Sub(s, e) onDeleteEvent()
        panel.Controls.Add(deleteBtn)

        Dim continueBtn = New Button()
        continueBtn.Text = "▶️ Continue"
        continueBtn.Location = New Point(700, 410)
        continueBtn.Size = New Size(150, 40)
        continueBtn.BackColor = UITheme.ColorInfo
        continueBtn.ForeColor = Color.White
        continueBtn.FlatStyle = FlatStyle.Flat
        continueBtn.Font = UITheme.FontSmall
        AddHandler continueBtn.Click, Sub(s, e) onContinueEvent()
        panel.Controls.Add(continueBtn)

        tabPage.Controls.Add(panel)
        Return (titleTxt, yearTxt, judgesTxt, eventList)
    End Function

    Private Shared Function CreateInputField(panel As Panel, label As String, x As Integer, y As Integer) As TextBox
        Dim lbl = New Label()
        lbl.Text = label
        lbl.ForeColor = UITheme.TextTertiary
        lbl.Location = New Point(x, y)
        lbl.AutoSize = True
        panel.Controls.Add(lbl)

        Dim txt = New TextBox()
        txt.Location = New Point(x, y + 25)
        txt.Size = New Size(400, 35)
        txt.Font = UITheme.FontSmall
        txt.BackColor = UITheme.BgSecondary
        txt.ForeColor = UITheme.TextPrimary
        txt.BorderStyle = BorderStyle.FixedSingle
        panel.Controls.Add(txt)

        Return txt
    End Function
End Class
