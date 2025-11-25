<div id="conceptual" class="erd-tab-content" style="padding: 1rem; background: #fafafa; border-radius: 4px; overflow: auto;"></div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const conceptualDot = `
        digraph ER {
            rankdir=TB;
            ratio=fill;
            size="12,16";
            node [fontname="Arial"];
            edge [fontname="Arial", fontsize=9];
            
            # Entities (rectangles)
            EVENTS [shape=box, style="filled", fillcolor="#c8e6c9", penwidth=2];
            CANDIDATES [shape=box, style="filled", fillcolor="#c8e6c9", penwidth=2];
            ROUNDS [shape=box, style="filled", fillcolor="#c8e6c9", penwidth=2];
            CRITERIA [shape=box, style="filled", fillcolor="#c8e6c9", penwidth=2];
            JUDGES [shape=box, style="filled", fillcolor="#c8e6c9", penwidth=2];
            VOTINGPOINTS [shape=box, style="filled", fillcolor="#c8e6c9", penwidth=2];
            VOTINGSTATES [shape=box, style="filled", fillcolor="#c8e6c9", penwidth=2];
            EVENTSEQ [shape=box, style="filled", fillcolor="#c8e6c9", penwidth=2];
            
            # Attributes (ovals)
            event_id [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            event_title [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            event_year [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            event_date [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            event_status [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            
            candidate_id [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            candidate_num [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            candidate_name [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            
            round_id [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            round_name [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            round_spot [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            
            criteria_id [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            criteria_name [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            criteria_max [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            
            judge_id [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            judge_num [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            judge_name [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            
            points_val [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            
            state_id [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            state_active [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            state_locked [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            
            seq_id [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            seq_order [shape=ellipse, style="filled", fillcolor="#a5d6a7"];
            
            # Relationships (diamonds)
            contains [shape=diamond, style="filled", fillcolor="#fff9c4", penwidth=2];
            has_rounds [shape=diamond, style="filled", fillcolor="#fff9c4", penwidth=2];
            tracks [shape=diamond, style="filled", fillcolor="#fff9c4", penwidth=2];
            orders [shape=diamond, style="filled", fillcolor="#fff9c4", penwidth=2];
            assigns [shape=diamond, style="filled", fillcolor="#fff9c4", penwidth=2];
            has_criteria [shape=diamond, style="filled", fillcolor="#fff9c4", penwidth=2];
            scores [shape=diamond, style="filled", fillcolor="#fff9c4", penwidth=2];
            receives [shape=diamond, style="filled", fillcolor="#fff9c4", penwidth=2];
            scored_by [shape=diamond, style="filled", fillcolor="#fff9c4", penwidth=2];
            submits [shape=diamond, style="filled", fillcolor="#fff9c4", penwidth=2];
            
            # EVENTS attributes
            EVENTS -> event_id;
            EVENTS -> event_title;
            EVENTS -> event_year;
            EVENTS -> event_date;
            EVENTS -> event_status;
            
            # CANDIDATES attributes
            CANDIDATES -> candidate_id;
            CANDIDATES -> candidate_num;
            CANDIDATES -> candidate_name;
            
            # ROUNDS attributes
            ROUNDS -> round_id;
            ROUNDS -> round_name;
            ROUNDS -> round_spot;
            
            # CRITERIA attributes
            CRITERIA -> criteria_id;
            CRITERIA -> criteria_name;
            CRITERIA -> criteria_max;
            
            # JUDGES attributes
            JUDGES -> judge_id;
            JUDGES -> judge_num;
            JUDGES -> judge_name;
            
            # VOTINGPOINTS attributes
            VOTINGPOINTS -> points_val;
            
            # VOTINGSTATES attributes
            VOTINGSTATES -> state_id;
            VOTINGSTATES -> state_active;
            VOTINGSTATES -> state_locked;
            
            # EVENTSEQ attributes
            EVENTSEQ -> seq_id;
            EVENTSEQ -> seq_order;
            
            # Relationships
            EVENTS -> contains [label="1"];
            contains -> CANDIDATES [label="N"];
            
            EVENTS -> has_rounds [label="1"];
            has_rounds -> ROUNDS [label="N"];
            
            EVENTS -> tracks [label="1"];
            tracks -> VOTINGSTATES [label="1"];
            
            EVENTS -> orders [label="1"];
            orders -> EVENTSEQ [label="N"];
            
            EVENTS -> assigns [label="1"];
            assigns -> JUDGES [label="N"];
            
            ROUNDS -> has_criteria [label="1"];
            has_criteria -> CRITERIA [label="N"];
            
            ROUNDS -> scores [label="1"];
            scores -> VOTINGPOINTS [label="N"];
            
            CANDIDATES -> receives [label="1"];
            receives -> VOTINGPOINTS [label="N"];
            
            CRITERIA -> scored_by [label="1"];
            scored_by -> VOTINGPOINTS [label="N"];
            
            JUDGES -> submits [label="1"];
            submits -> VOTINGPOINTS [label="N"];
            
            EVENTSEQ -> orders [label="N"];
        }
    `;
    
    try {
        const viz = new Viz();
        viz.renderString(conceptualDot).then(svg => {
            document.getElementById('conceptual').innerHTML = svg;
        }).catch(e => {
            console.error('Viz.js error:', e);
            document.getElementById('conceptual').innerHTML = '<p>Error rendering diagram</p>';
        });
    } catch(e) {
        console.error('Viz.js error:', e);
        document.getElementById('conceptual').innerHTML = '<p>Error rendering diagram</p>';
    }
});
</script>
