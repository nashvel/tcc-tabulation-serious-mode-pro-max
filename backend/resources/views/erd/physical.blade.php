<div id="physical" class="erd-tab-content" style="padding: 1rem; background: #fafafa; border-radius: 4px; overflow: auto;"></div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const physicalDot = `
        digraph ER {
            rankdir=TB;
            ratio=fill;
            size="12,16";
            node [shape=plaintext, fontname="Arial"];
            edge [fontname="Arial", fontsize=9];
            
            EVENTS [label=<
                <TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0" BGCOLOR="#a5d6a7">
                    <TR><TD COLSPAN="3" BGCOLOR="#1b5e20"><FONT COLOR="white"><B>events</B></FONT></TD></TR>
                    <TR><TD><B>Column</B></TD><TD><B>Data Type</B></TD><TD><B>Key</B></TD></TR>
                    <TR><TD>id</TD><TD>INT</TD><TD>PK</TD></TR>
                    <TR><TD>title</TD><TD>VARCHAR(255)</TD><TD></TD></TR>
                    <TR><TD>year</TD><TD>INT</TD><TD></TD></TR>
                    <TR><TD>date</TD><TD>DATE</TD><TD></TD></TR>
                    <TR><TD>status</TD><TD>VARCHAR(50)</TD><TD></TD></TR>
                    <TR><TD>created_at</TD><TD>TIMESTAMP</TD><TD></TD></TR>
                    <TR><TD>updated_at</TD><TD>TIMESTAMP</TD><TD></TD></TR>
                </TABLE>
            >];
            
            CANDIDATES [label=<
                <TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0" BGCOLOR="#a5d6a7">
                    <TR><TD COLSPAN="3" BGCOLOR="#1b5e20"><FONT COLOR="white"><B>candidates</B></FONT></TD></TR>
                    <TR><TD><B>Column</B></TD><TD><B>Data Type</B></TD><TD><B>Key</B></TD></TR>
                    <TR><TD>id</TD><TD>INT</TD><TD>PK</TD></TR>
                    <TR><TD>event_id</TD><TD>INT</TD><TD>FK</TD></TR>
                    <TR><TD>number</TD><TD>INT</TD><TD></TD></TR>
                    <TR><TD>name</TD><TD>VARCHAR(255)</TD><TD></TD></TR>
                    <TR><TD>gender</TD><TD>VARCHAR(50)</TD><TD></TD></TR>
                    <TR><TD>created_at</TD><TD>TIMESTAMP</TD><TD></TD></TR>
                </TABLE>
            >];
            
            ROUNDS [label=<
                <TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0" BGCOLOR="#a5d6a7">
                    <TR><TD COLSPAN="3" BGCOLOR="#1b5e20"><FONT COLOR="white"><B>rounds</B></FONT></TD></TR>
                    <TR><TD><B>Column</B></TD><TD><B>Data Type</B></TD><TD><B>Key</B></TD></TR>
                    <TR><TD>id</TD><TD>INT</TD><TD>PK</TD></TR>
                    <TR><TD>event_id</TD><TD>INT</TD><TD>FK</TD></TR>
                    <TR><TD>name</TD><TD>VARCHAR(255)</TD><TD></TD></TR>
                    <TR><TD>spot</TD><TD>INT</TD><TD></TD></TR>
                    <TR><TD>created_at</TD><TD>TIMESTAMP</TD><TD></TD></TR>
                    <TR><TD>updated_at</TD><TD>TIMESTAMP</TD><TD></TD></TR>
                </TABLE>
            >];
            
            CRITERIA [label=<
                <TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0" BGCOLOR="#a5d6a7">
                    <TR><TD COLSPAN="3" BGCOLOR="#1b5e20"><FONT COLOR="white"><B>criteria</B></FONT></TD></TR>
                    <TR><TD><B>Column</B></TD><TD><B>Data Type</B></TD><TD><B>Key</B></TD></TR>
                    <TR><TD>id</TD><TD>INT</TD><TD>PK</TD></TR>
                    <TR><TD>round_id</TD><TD>INT</TD><TD>FK</TD></TR>
                    <TR><TD>name</TD><TD>VARCHAR(255)</TD><TD></TD></TR>
                    <TR><TD>max_points</TD><TD>INT</TD><TD></TD></TR>
                    <TR><TD>created_at</TD><TD>TIMESTAMP</TD><TD></TD></TR>
                </TABLE>
            >];
            
            JUDGES [label=<
                <TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0" BGCOLOR="#a5d6a7">
                    <TR><TD COLSPAN="3" BGCOLOR="#1b5e20"><FONT COLOR="white"><B>judges</B></FONT></TD></TR>
                    <TR><TD><B>Column</B></TD><TD><B>Data Type</B></TD><TD><B>Key</B></TD></TR>
                    <TR><TD>id</TD><TD>INT</TD><TD>PK</TD></TR>
                    <TR><TD>event_id</TD><TD>INT</TD><TD>FK</TD></TR>
                    <TR><TD>judge_number</TD><TD>INT</TD><TD></TD></TR>
                    <TR><TD>name</TD><TD>VARCHAR(255)</TD><TD></TD></TR>
                    <TR><TD>pin</TD><TD>VARCHAR(10)</TD><TD></TD></TR>
                    <TR><TD>occupied</TD><TD>BOOLEAN</TD><TD></TD></TR>
                </TABLE>
            >];
            
            VOTINGPOINTS [label=<
                <TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0" BGCOLOR="#a5d6a7">
                    <TR><TD COLSPAN="3" BGCOLOR="#1b5e20"><FONT COLOR="white"><B>voting_points</B></FONT></TD></TR>
                    <TR><TD><B>Column</B></TD><TD><B>Data Type</B></TD><TD><B>Key</B></TD></TR>
                    <TR><TD>id</TD><TD>INT</TD><TD>PK</TD></TR>
                    <TR><TD>judge_id</TD><TD>INT</TD><TD>FK</TD></TR>
                    <TR><TD>candidate_id</TD><TD>INT</TD><TD>FK</TD></TR>
                    <TR><TD>round_id</TD><TD>INT</TD><TD>FK</TD></TR>
                    <TR><TD>criteria_id</TD><TD>INT</TD><TD>FK</TD></TR>
                    <TR><TD>points</TD><TD>DECIMAL(5,2)</TD><TD></TD></TR>
                    <TR><TD>created_at</TD><TD>TIMESTAMP</TD><TD></TD></TR>
                </TABLE>
            >];
            
            VOTINGSTATES [label=<
                <TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0" BGCOLOR="#a5d6a7">
                    <TR><TD COLSPAN="3" BGCOLOR="#1b5e20"><FONT COLOR="white"><B>voting_states</B></FONT></TD></TR>
                    <TR><TD><B>Column</B></TD><TD><B>Data Type</B></TD><TD><B>Key</B></TD></TR>
                    <TR><TD>id</TD><TD>INT</TD><TD>PK</TD></TR>
                    <TR><TD>event_id</TD><TD>INT</TD><TD>FK</TD></TR>
                    <TR><TD>is_active</TD><TD>BOOLEAN</TD><TD></TD></TR>
                    <TR><TD>is_locked</TD><TD>BOOLEAN</TD><TD></TD></TR>
                    <TR><TD>active_round_id</TD><TD>INT</TD><TD></TD></TR>
                    <TR><TD>created_at</TD><TD>TIMESTAMP</TD><TD></TD></TR>
                </TABLE>
            >];
            
            EVENTSEQ [label=<
                <TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0" BGCOLOR="#a5d6a7">
                    <TR><TD COLSPAN="3" BGCOLOR="#1b5e20"><FONT COLOR="white"><B>event_sequences</B></FONT></TD></TR>
                    <TR><TD><B>Column</B></TD><TD><B>Data Type</B></TD><TD><B>Key</B></TD></TR>
                    <TR><TD>id</TD><TD>INT</TD><TD>PK</TD></TR>
                    <TR><TD>event_id</TD><TD>INT</TD><TD>FK</TD></TR>
                    <TR><TD>round_id</TD><TD>INT</TD><TD>FK</TD></TR>
                    <TR><TD>order</TD><TD>INT</TD><TD></TD></TR>
                    <TR><TD>created_at</TD><TD>TIMESTAMP</TD><TD></TD></TR>
                </TABLE>
            >];
            
            EVENTS -> CANDIDATES [label="1:N", arrowhead=crow];
            EVENTS -> ROUNDS [label="1:N", arrowhead=crow];
            EVENTS -> VOTINGSTATES [label="1:1", arrowhead=none];
            EVENTS -> EVENTSEQ [label="1:N", arrowhead=crow];
            EVENTS -> JUDGES [label="1:N", arrowhead=crow];
            ROUNDS -> CRITERIA [label="1:N", arrowhead=crow];
            ROUNDS -> VOTINGPOINTS [label="1:N", arrowhead=crow];
            CANDIDATES -> VOTINGPOINTS [label="1:N", arrowhead=crow];
            CRITERIA -> VOTINGPOINTS [label="1:N", arrowhead=crow];
            JUDGES -> VOTINGPOINTS [label="1:N", arrowhead=crow];
            EVENTSEQ -> ROUNDS [label="N:1", arrowhead=none];
        }
    `;
    
    try {
        const viz = new Viz();
        viz.renderString(physicalDot).then(svg => {
            document.getElementById('physical').innerHTML = svg;
        }).catch(e => {
            console.error('Viz.js error:', e);
            document.getElementById('physical').innerHTML = '<p>Error rendering diagram</p>';
        });
    } catch(e) {
        console.error('Viz.js error:', e);
        document.getElementById('physical').innerHTML = '<p>Error rendering diagram</p>';
    }
});
</script>
