<div id="logical" class="erd-tab-content" style="padding: 1rem; background: #fafafa; border-radius: 4px; overflow: auto;"></div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const logicalDot = `
        digraph ER {
            rankdir=TB;
            ratio=fill;
            size="12,16";
            node [shape=plaintext, fontname="Arial"];
            edge [fontname="Arial", fontsize=9];
            
            EVENTS [label=<
                <TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0" BGCOLOR="#e1bee7">
                    <TR><TD COLSPAN="3" BGCOLOR="#7b1fa2"><FONT COLOR="white"><B>EVENTS</B></FONT></TD></TR>
                    <TR><TD><B>Attribute</B></TD><TD><B>Type</B></TD><TD><B>Key</B></TD></TR>
                    <TR><TD>event_id</TD><TD>Integer</TD><TD>PK</TD></TR>
                    <TR><TD>title</TD><TD>String</TD><TD></TD></TR>
                    <TR><TD>year</TD><TD>Integer</TD><TD></TD></TR>
                    <TR><TD>event_date</TD><TD>Date</TD><TD></TD></TR>
                    <TR><TD>status</TD><TD>String</TD><TD></TD></TR>
                </TABLE>
            >];
            
            CANDIDATES [label=<
                <TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0" BGCOLOR="#e1bee7">
                    <TR><TD COLSPAN="3" BGCOLOR="#7b1fa2"><FONT COLOR="white"><B>CANDIDATES</B></FONT></TD></TR>
                    <TR><TD><B>Attribute</B></TD><TD><B>Type</B></TD><TD><B>Key</B></TD></TR>
                    <TR><TD>candidate_id</TD><TD>Integer</TD><TD>PK</TD></TR>
                    <TR><TD>event_id</TD><TD>Integer</TD><TD>FK</TD></TR>
                    <TR><TD>candidate_number</TD><TD>Integer</TD><TD></TD></TR>
                    <TR><TD>name</TD><TD>String</TD><TD></TD></TR>
                </TABLE>
            >];
            
            ROUNDS [label=<
                <TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0" BGCOLOR="#e1bee7">
                    <TR><TD COLSPAN="3" BGCOLOR="#7b1fa2"><FONT COLOR="white"><B>ROUNDS</B></FONT></TD></TR>
                    <TR><TD><B>Attribute</B></TD><TD><B>Type</B></TD><TD><B>Key</B></TD></TR>
                    <TR><TD>round_id</TD><TD>Integer</TD><TD>PK</TD></TR>
                    <TR><TD>event_id</TD><TD>Integer</TD><TD>FK</TD></TR>
                    <TR><TD>round_name</TD><TD>String</TD><TD></TD></TR>
                    <TR><TD>round_order</TD><TD>Integer</TD><TD></TD></TR>
                </TABLE>
            >];
            
            CRITERIA [label=<
                <TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0" BGCOLOR="#e1bee7">
                    <TR><TD COLSPAN="3" BGCOLOR="#7b1fa2"><FONT COLOR="white"><B>CRITERIA</B></FONT></TD></TR>
                    <TR><TD><B>Attribute</B></TD><TD><B>Type</B></TD><TD><B>Key</B></TD></TR>
                    <TR><TD>criteria_id</TD><TD>Integer</TD><TD>PK</TD></TR>
                    <TR><TD>round_id</TD><TD>Integer</TD><TD>FK</TD></TR>
                    <TR><TD>criteria_name</TD><TD>String</TD><TD></TD></TR>
                    <TR><TD>max_score</TD><TD>Integer</TD><TD></TD></TR>
                </TABLE>
            >];
            
            JUDGES [label=<
                <TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0" BGCOLOR="#e1bee7">
                    <TR><TD COLSPAN="3" BGCOLOR="#7b1fa2"><FONT COLOR="white"><B>JUDGES</B></FONT></TD></TR>
                    <TR><TD><B>Attribute</B></TD><TD><B>Type</B></TD><TD><B>Key</B></TD></TR>
                    <TR><TD>judge_id</TD><TD>Integer</TD><TD>PK</TD></TR>
                    <TR><TD>event_id</TD><TD>Integer</TD><TD>FK</TD></TR>
                    <TR><TD>judge_number</TD><TD>Integer</TD><TD></TD></TR>
                    <TR><TD>name</TD><TD>String</TD><TD></TD></TR>
                </TABLE>
            >];
            
            VOTINGPOINTS [label=<
                <TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0" BGCOLOR="#e1bee7">
                    <TR><TD COLSPAN="3" BGCOLOR="#7b1fa2"><FONT COLOR="white"><B>VOTING_POINTS</B></FONT></TD></TR>
                    <TR><TD><B>Attribute</B></TD><TD><B>Type</B></TD><TD><B>Key</B></TD></TR>
                    <TR><TD>point_id</TD><TD>Integer</TD><TD>PK</TD></TR>
                    <TR><TD>judge_id</TD><TD>Integer</TD><TD>FK</TD></TR>
                    <TR><TD>candidate_id</TD><TD>Integer</TD><TD>FK</TD></TR>
                    <TR><TD>round_id</TD><TD>Integer</TD><TD>FK</TD></TR>
                    <TR><TD>criteria_id</TD><TD>Integer</TD><TD>FK</TD></TR>
                    <TR><TD>score_value</TD><TD>Decimal</TD><TD></TD></TR>
                </TABLE>
            >];
            
            VOTINGSTATES [label=<
                <TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0" BGCOLOR="#e1bee7">
                    <TR><TD COLSPAN="3" BGCOLOR="#7b1fa2"><FONT COLOR="white"><B>VOTING_STATES</B></FONT></TD></TR>
                    <TR><TD><B>Attribute</B></TD><TD><B>Type</B></TD><TD><B>Key</B></TD></TR>
                    <TR><TD>state_id</TD><TD>Integer</TD><TD>PK</TD></TR>
                    <TR><TD>event_id</TD><TD>Integer</TD><TD>FK</TD></TR>
                    <TR><TD>voting_active</TD><TD>Boolean</TD><TD></TD></TR>
                    <TR><TD>screens_locked</TD><TD>Boolean</TD><TD></TD></TR>
                </TABLE>
            >];
            
            EVENTSEQ [label=<
                <TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0" BGCOLOR="#e1bee7">
                    <TR><TD COLSPAN="3" BGCOLOR="#7b1fa2"><FONT COLOR="white"><B>EVENT_SEQUENCES</B></FONT></TD></TR>
                    <TR><TD><B>Attribute</B></TD><TD><B>Type</B></TD><TD><B>Key</B></TD></TR>
                    <TR><TD>sequence_id</TD><TD>Integer</TD><TD>PK</TD></TR>
                    <TR><TD>event_id</TD><TD>Integer</TD><TD>FK</TD></TR>
                    <TR><TD>round_id</TD><TD>Integer</TD><TD>FK</TD></TR>
                    <TR><TD>sequence_order</TD><TD>Integer</TD><TD></TD></TR>
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
        viz.renderString(logicalDot).then(svg => {
            document.getElementById('logical').innerHTML = svg;
        }).catch(e => {
            console.error('Viz.js error:', e);
            document.getElementById('logical').innerHTML = '<p>Error rendering diagram</p>';
        });
    } catch(e) {
        console.error('Viz.js error:', e);
        document.getElementById('logical').innerHTML = '<p>Error rendering diagram</p>';
    }
});
</script>
