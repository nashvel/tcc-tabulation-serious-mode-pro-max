using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Diagnostics;
using System.Net.Http;

namespace TabulationSystem
{
    public partial class Form1 : Form
    {
        private Dictionary<string, Process> serviceProcesses = new Dictionary<string, Process>();
        private Dictionary<string, bool> serviceStatus = new Dictionary<string, bool>
        {
            { "redis", false },
            { "laravel", false },
            { "echo", false },
            { "frontend", false }
        };
        private HttpClient httpClient = new HttpClient();

        public Form1()
        {
            InitializeComponent();
            SetupUI();
        }

        private void SetupUI()
        {
            // Style the existing sidebar with gradient effect
            panel1.BackColor = Color.FromArgb(25, 118, 210);
            this.BackColor = Color.FromArgb(245, 247, 250);
            
            // Style buttons - Dashboard, Events, Terminals, Settings
            button1.BackColor = Color.White;
            button1.ForeColor = Color.FromArgb(25, 118, 210);
            button1.Font = new Font("Segoe UI", 11, FontStyle.Bold);
            button1.FlatStyle = FlatStyle.Flat;
            button1.FlatAppearance.BorderSize = 0;
            button1.Cursor = Cursors.Hand;
            button1.Text = "📊 Dashboard";
            button1.Click += (s, e) => ShowServices();
            
            button3.BackColor = Color.White;
            button3.ForeColor = Color.FromArgb(25, 118, 210);
            button3.Font = new Font("Segoe UI", 11, FontStyle.Bold);
            button3.FlatStyle = FlatStyle.Flat;
            button3.FlatAppearance.BorderSize = 0;
            button3.Cursor = Cursors.Hand;
            button3.Text = "📅 Events";
            button3.Click += (s, e) => ShowEvents();
            
            button2.BackColor = Color.White;
            button2.ForeColor = Color.FromArgb(25, 118, 210);
            button2.Font = new Font("Segoe UI", 11, FontStyle.Bold);
            button2.FlatStyle = FlatStyle.Flat;
            button2.FlatAppearance.BorderSize = 0;
            button2.Cursor = Cursors.Hand;
            button2.Text = "📋 Logs";
            button2.Click += (s, e) => ShowLogs();
            
            button4.BackColor = Color.White;
            button4.ForeColor = Color.FromArgb(25, 118, 210);
            button4.Font = new Font("Segoe UI", 11, FontStyle.Bold);
            button4.FlatStyle = FlatStyle.Flat;
            button4.FlatAppearance.BorderSize = 0;
            button4.Cursor = Cursors.Hand;
            button4.Text = "⚙️ Settings";
            
            // Style richTextBox (title)
            richTextBox1.BackColor = Color.FromArgb(25, 118, 210);
            richTextBox1.ForeColor = Color.White;
            richTextBox1.Font = new Font("Segoe UI", 13, FontStyle.Bold);
            richTextBox1.ScrollBars = RichTextBoxScrollBars.None;
            richTextBox1.Text = "🎓 Tabulation";
            richTextBox1.ReadOnly = true;
            richTextBox1.BorderStyle = BorderStyle.None;

            // Create content panel
            Panel contentPanel = new Panel();
            contentPanel.BackColor = Color.FromArgb(245, 247, 250);
            contentPanel.Location = new Point(200, 0);
            contentPanel.Size = new Size(1400, 900);
            contentPanel.AutoScroll = true;
            contentPanel.Name = "contentPanel";
            this.Controls.Add(contentPanel);

            AddLog("✓ Application started successfully");
            ShowServices();
        }

        private Panel GetContentPanel()
        {
            return this.Controls["contentPanel"] as Panel;
        }

        private void ShowServices()
        {
            Panel contentPanel = GetContentPanel();
            contentPanel.Controls.Clear();

            // Header with icon
            Label header = new Label();
            header.Text = "⚙️ Service Management";
            header.Font = new Font("Segoe UI", 28, FontStyle.Bold);
            header.ForeColor = Color.FromArgb(25, 118, 210);
            header.Location = new Point(50, 20);
            header.AutoSize = true;
            contentPanel.Controls.Add(header);

            // Divider line
            Panel divider = new Panel();
            divider.BackColor = Color.FromArgb(200, 210, 220);
            divider.Location = new Point(50, 65);
            divider.Size = new Size(1000, 2);
            contentPanel.Controls.Add(divider);

            // Description
            Label desc = new Label();
            desc.Text = "Manage and monitor all backend services";
            desc.Font = new Font("Segoe UI", 12);
            desc.ForeColor = Color.FromArgb(117, 117, 117);
            desc.Location = new Point(50, 80);
            desc.AutoSize = true;
            contentPanel.Controls.Add(desc);

            // Service cards - 2 per row
            string[] services = { "redis", "laravel", "echo", "frontend" };
            string[] serviceNames = { "🔴 Redis Cache", "🟢 Laravel Backend", "🔵 Echo Server", "🟡 Frontend Dev" };
            int x = 50;
            int y = 140;

            for (int i = 0; i < services.Length; i++)
            {
                Panel card = CreateServiceCard(services[i], serviceNames[i], x, y);
                contentPanel.Controls.Add(card);

                x += 420;
                if ((i + 1) % 2 == 0)
                {
                    x = 50;
                    y += 160;
                }
            }

            // Quick Actions section
            Label actionHeader = new Label();
            actionHeader.Text = "⚡ Quick Actions";
            actionHeader.Font = new Font("Segoe UI", 18, FontStyle.Bold);
            actionHeader.ForeColor = Color.FromArgb(25, 118, 210);
            actionHeader.Location = new Point(50, y + 50);
            actionHeader.AutoSize = true;
            contentPanel.Controls.Add(actionHeader);

            Button refreshBtn = CreateActionButton("🔄 Refresh Status", 50, y + 100, Color.FromArgb(59, 130, 246));
            refreshBtn.Click += (s, e) => AddLog("✓ Refreshing service status...");
            contentPanel.Controls.Add(refreshBtn);

            Button setupBtn = CreateActionButton("🛠️ Open Setup", 420, y + 100, Color.FromArgb(139, 92, 246));
            setupBtn.Click += (s, e) => OpenBrowser("http://localhost:5173/admin/setup");
            contentPanel.Controls.Add(setupBtn);

            Button adminBtn = CreateActionButton("👨‍� Open Admin", 790, y + 100, Color.FromArgb(245, 158, 11));
            adminBtn.Click += (s, e) => OpenBrowser("http://localhost:5173/admin");
            contentPanel.Controls.Add(adminBtn);

            AddLog("✓ Dashboard loaded");
        }

        private Panel CreateServiceCard(string serviceName, string displayName, int x, int y)
        {
            Panel card = new Panel();
            card.Location = new Point(x, y);
            card.Size = new Size(350, 130);
            card.BackColor = Color.White;
            card.BorderStyle = BorderStyle.None;
            card.Padding = new Padding(20);

            // Add shadow effect with border
            Panel shadow = new Panel();
            shadow.BackColor = Color.FromArgb(230, 235, 240);
            shadow.Location = new Point(x + 3, y + 3);
            shadow.Size = new Size(350, 130);
            shadow.BorderStyle = BorderStyle.FixedSingle;

            Label nameLabel = new Label();
            nameLabel.Text = displayName;
            nameLabel.Font = new Font("Segoe UI", 14, FontStyle.Bold);
            nameLabel.ForeColor = Color.FromArgb(25, 118, 210);
            nameLabel.Location = new Point(15, 15);
            nameLabel.AutoSize = true;
            card.Controls.Add(nameLabel);

            Label statusLabel = new Label();
            statusLabel.Text = "🔴 Stopped";
            statusLabel.Font = new Font("Segoe UI", 11);
            statusLabel.ForeColor = Color.FromArgb(239, 68, 68);
            statusLabel.Location = new Point(15, 50);
            statusLabel.AutoSize = true;
            statusLabel.Name = serviceName + "_status";
            card.Controls.Add(statusLabel);

            Button btn = new Button();
            btn.Text = "▶️ Start Service";
            btn.Location = new Point(15, 75);
            btn.Size = new Size(320, 40);
            btn.BackColor = Color.FromArgb(239, 68, 68);
            btn.ForeColor = Color.White;
            btn.FlatStyle = FlatStyle.Flat;
            btn.Font = new Font("Segoe UI", 11, FontStyle.Bold);
            btn.Cursor = Cursors.Hand;
            btn.Tag = serviceName;
            btn.FlatAppearance.BorderSize = 0;
            btn.Click += (s, e) => ToggleService(serviceName, btn, statusLabel);
            card.Controls.Add(btn);

            return card;
        }

        private Button CreateActionButton(string text, int x, int y, Color bgColor)
        {
            Button btn = new Button();
            btn.Text = text;
            btn.Location = new Point(x, y);
            btn.Size = new Size(340, 55);
            btn.BackColor = bgColor;
            btn.ForeColor = Color.White;
            btn.FlatStyle = FlatStyle.Flat;
            btn.Font = new Font("Segoe UI", 12, FontStyle.Bold);
            btn.Cursor = Cursors.Hand;
            btn.FlatAppearance.BorderSize = 0;
            btn.FlatAppearance.MouseOverBackColor = AdjustBrightness(bgColor, 1.2);
            return btn;
        }

        private Color AdjustBrightness(Color color, double factor)
        {
            return Color.FromArgb(
                Math.Min(255, (int)(color.R * factor)),
                Math.Min(255, (int)(color.G * factor)),
                Math.Min(255, (int)(color.B * factor))
            );
        }

        private void ToggleService(string serviceName, Button btn, Label statusLabel)
        {
            if (serviceStatus[serviceName])
            {
                AddLog($"⏹️ Stopping {serviceName}...");
                serviceStatus[serviceName] = false;
                btn.Text = "▶️ Start Service";
                btn.BackColor = Color.FromArgb(239, 68, 68);
                statusLabel.Text = "🔴 Stopped";
                statusLabel.ForeColor = Color.FromArgb(239, 68, 68);
                AddLog($"✓ {serviceName} stopped successfully");
            }
            else
            {
                AddLog($"▶️ Starting {serviceName}...");
                serviceStatus[serviceName] = true;
                btn.Text = "⏹️ Stop Service";
                btn.BackColor = Color.FromArgb(34, 197, 94);
                statusLabel.Text = "🟢 Running";
                statusLabel.ForeColor = Color.FromArgb(34, 197, 94);
                AddLog($"✓ {serviceName} started successfully");
            }
        }

        private void ShowEvents()
        {
            Panel contentPanel = GetContentPanel();
            contentPanel.Controls.Clear();

            Label header = new Label();
            header.Text = "Event Management";
            header.Font = new Font("Segoe UI", 24, FontStyle.Bold);
            header.ForeColor = Color.FromArgb(33, 33, 33);
            header.Location = new Point(40, 30);
            header.AutoSize = true;
            contentPanel.Controls.Add(header);

            // LEFT SIDE - Create Event Form
            Label formLabel = new Label();
            formLabel.Text = "Create New Event";
            formLabel.Font = new Font("Segoe UI", 16, FontStyle.Bold);
            formLabel.ForeColor = Color.FromArgb(33, 33, 33);
            formLabel.Location = new Point(40, 80);
            formLabel.AutoSize = true;
            contentPanel.Controls.Add(formLabel);

            int y = 130;

            Label titleLabel = new Label();
            titleLabel.Text = "Event Title:";
            titleLabel.ForeColor = Color.FromArgb(117, 117, 117);
            titleLabel.Location = new Point(40, y);
            titleLabel.AutoSize = true;
            contentPanel.Controls.Add(titleLabel);

            TextBox titleTxt = new TextBox();
            titleTxt.Location = new Point(40, y + 25);
            titleTxt.Size = new Size(300, 35);
            titleTxt.Font = new Font("Segoe UI", 11);
            titleTxt.BackColor = Color.White;
            titleTxt.ForeColor = Color.FromArgb(33, 33, 33);
            titleTxt.BorderStyle = BorderStyle.FixedSingle;
            contentPanel.Controls.Add(titleTxt);

            y += 70;

            Label yearLabel = new Label();
            yearLabel.Text = "Year:";
            yearLabel.ForeColor = Color.FromArgb(117, 117, 117);
            yearLabel.Location = new Point(40, y);
            yearLabel.AutoSize = true;
            contentPanel.Controls.Add(yearLabel);

            TextBox yearTxt = new TextBox();
            yearTxt.Location = new Point(40, y + 25);
            yearTxt.Size = new Size(300, 35);
            yearTxt.Font = new Font("Segoe UI", 11);
            yearTxt.Text = DateTime.Now.Year.ToString();
            yearTxt.BackColor = Color.White;
            yearTxt.ForeColor = Color.FromArgb(33, 33, 33);
            yearTxt.BorderStyle = BorderStyle.FixedSingle;
            contentPanel.Controls.Add(yearTxt);

            y += 70;

            Label judgesLabel = new Label();
            judgesLabel.Text = "Number of Judges:";
            judgesLabel.ForeColor = Color.FromArgb(117, 117, 117);
            judgesLabel.Location = new Point(40, y);
            judgesLabel.AutoSize = true;
            contentPanel.Controls.Add(judgesLabel);

            TextBox judgesTxt = new TextBox();
            judgesTxt.Location = new Point(40, y + 25);
            judgesTxt.Size = new Size(300, 35);
            judgesTxt.Font = new Font("Segoe UI", 11);
            judgesTxt.BackColor = Color.White;
            judgesTxt.ForeColor = Color.FromArgb(33, 33, 33);
            judgesTxt.BorderStyle = BorderStyle.FixedSingle;
            contentPanel.Controls.Add(judgesTxt);

            y += 70;

            Button createBtn = new Button();
            createBtn.Text = "✓ Create Event";
            createBtn.Location = new Point(40, y);
            createBtn.Size = new Size(300, 50);
            createBtn.BackColor = Color.FromArgb(34, 197, 94);
            createBtn.ForeColor = Color.White;
            createBtn.FlatStyle = FlatStyle.Flat;
            createBtn.Font = new Font("Segoe UI", 12, FontStyle.Bold);
            createBtn.Click += (s, e) => AddLog($"Creating event: {titleTxt.Text}");
            contentPanel.Controls.Add(createBtn);

            // RIGHT SIDE - Existing Events List
            Label existingLabel = new Label();
            existingLabel.Text = "Existing Events";
            existingLabel.Font = new Font("Segoe UI", 16, FontStyle.Bold);
            existingLabel.ForeColor = Color.FromArgb(33, 33, 33);
            existingLabel.Location = new Point(450, 80);
            existingLabel.AutoSize = true;
            contentPanel.Controls.Add(existingLabel);

            ListBox eventListBox = new ListBox();
            eventListBox.Location = new Point(450, 130);
            eventListBox.Size = new Size(500, 300);
            eventListBox.BackColor = Color.FromArgb(245, 245, 245);
            eventListBox.ForeColor = Color.FromArgb(33, 33, 33);
            eventListBox.Font = new Font("Segoe UI", 11);
            eventListBox.Name = "eventListBox";
            contentPanel.Controls.Add(eventListBox);

            // Load events from API
            LoadEventsFromAPI(eventListBox);

            // Action buttons
            Button deleteBtn = new Button();
            deleteBtn.Text = "🗑️ Delete";
            deleteBtn.Location = new Point(450, 450);
            deleteBtn.Size = new Size(150, 40);
            deleteBtn.BackColor = Color.FromArgb(239, 68, 68);
            deleteBtn.ForeColor = Color.White;
            deleteBtn.FlatStyle = FlatStyle.Flat;
            deleteBtn.Font = new Font("Segoe UI", 11, FontStyle.Bold);
            deleteBtn.Click += (s, e) => DeleteEvent(eventListBox);
            contentPanel.Controls.Add(deleteBtn);

            Button continueBtn = new Button();
            continueBtn.Text = "▶️ Continue Event";
            continueBtn.Location = new Point(620, 450);
            continueBtn.Size = new Size(150, 40);
            continueBtn.BackColor = Color.FromArgb(59, 130, 246);
            continueBtn.ForeColor = Color.White;
            continueBtn.FlatStyle = FlatStyle.Flat;
            continueBtn.Font = new Font("Segoe UI", 11, FontStyle.Bold);
            continueBtn.Click += (s, e) => ContinueEvent(eventListBox);
            contentPanel.Controls.Add(continueBtn);

            AddLog("Event management page loaded");
        }

        private void LoadEventsFromAPI(ListBox listBox)
        {
            try
            {
                AddLog("Fetching events from API...");
                // TODO: Replace with actual API call to http://localhost:8000/api/events
                // Example: var response = httpClient.GetAsync("http://localhost:8000/api/events").Result;
                
                listBox.Items.Add("Event 1 - 2025");
                listBox.Items.Add("Event 2 - 2025");
                listBox.Items.Add("Event 3 - 2025");
                
                AddLog("Events loaded successfully");
            }
            catch (Exception ex)
            {
                AddLog($"Error loading events: {ex.Message}");
            }
        }

        private void DeleteEvent(ListBox listBox)
        {
            if (listBox.SelectedIndex == -1)
            {
                MessageBox.Show("Please select an event to delete", "Selection Error");
                return;
            }

            try
            {
                AddLog($"Deleting event: {listBox.SelectedItem}");
                listBox.Items.RemoveAt(listBox.SelectedIndex);
                AddLog("Event deleted successfully");
            }
            catch (Exception ex)
            {
                AddLog($"Error deleting event: {ex.Message}");
            }
        }

        private void ContinueEvent(ListBox listBox)
        {
            if (listBox.SelectedIndex == -1)
            {
                MessageBox.Show("Please select an event to continue", "Selection Error");
                return;
            }

            try
            {
                AddLog($"Continuing event: {listBox.SelectedItem}");
                OpenBrowser("http://localhost:5173/admin");
            }
            catch (Exception ex)
            {
                AddLog($"Error continuing event: {ex.Message}");
            }
        }

        private void ShowLogs()
        {
            Panel contentPanel = GetContentPanel();
            contentPanel.Controls.Clear();

            Label header = new Label();
            header.Text = "Application Logs";
            header.Font = new Font("Segoe UI", 24, FontStyle.Bold);
            header.ForeColor = Color.FromArgb(33, 33, 33);
            header.Location = new Point(40, 30);
            header.AutoSize = true;
            contentPanel.Controls.Add(header);

            RichTextBox logsBox = new RichTextBox();
            logsBox.Location = new Point(40, 80);
            logsBox.Size = new Size(1200, 700);
            logsBox.BackColor = Color.FromArgb(245, 245, 245);
            logsBox.ForeColor = Color.FromArgb(33, 33, 33);
            logsBox.ReadOnly = true;
            logsBox.Font = new Font("Courier New", 10);
            logsBox.ScrollBars = RichTextBoxScrollBars.None;
            logsBox.Name = "logsBox";
            contentPanel.Controls.Add(logsBox);
        }

        private void AddLog(string message)
        {
            Panel contentPanel = this.Controls["contentPanel"] as Panel;
            RichTextBox logsBox = contentPanel?.Controls["logsBox"] as RichTextBox;
            if (logsBox != null)
            {
                logsBox.AppendText($"[{DateTime.Now:HH:mm:ss}] {message}\n");
            }
        }

        private void OpenBrowser(string url)
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = url,
                    UseShellExecute = true
                });
                AddLog($"Opening {url}");
            }
            catch (Exception ex)
            {
                AddLog($"Error opening browser: {ex.Message}");
            }
        }

        private void panel1_Paint(object sender, PaintEventArgs e)
        {
        }

        private void panel2_Paint(object sender, PaintEventArgs e)
        {
        }

        private void button1_Click(object sender, EventArgs e)
        {
        }

        private void richTextBox1_TextChanged(object sender, EventArgs e)
        {
        }

        private void button2_Click(object sender, EventArgs e)
        {
        }

        private void button3_Click(object sender, EventArgs e)
        {
        }

        private void button4_Click(object sender, EventArgs e)
        {
        }

        private void DrawRoundedPanel(Panel p, int radius, PaintEventArgs e)
        {
            Graphics g = e.Graphics;
            g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;

            Rectangle r = new Rectangle(0, 0, p.Width, p.Height);

            System.Drawing.Drawing2D.GraphicsPath path = new System.Drawing.Drawing2D.GraphicsPath();
            int d = radius * 2;

            path.AddArc(r.X, r.Y, d, d, 180, 90);
            path.AddArc(r.X + r.Width - d, r.Y, d, d, 270, 90);
            path.AddArc(r.X + r.Width - d, r.Y + r.Height - d, d, d, 0, 90);
            path.AddArc(r.X, r.Y + r.Height - d, d, d, 90, 90);
            path.CloseFigure();

            SolidBrush brush = new SolidBrush(Color.FromArgb(245, 248, 255));
            g.FillPath(brush, path);
        }
    }
}
