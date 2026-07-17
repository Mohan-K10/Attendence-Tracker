import json

letters = {
    'T': [
        "XXXXX",
        "..X..",
        "..X..",
        "..X..",
        "..X.."
    ],
    'R': [
        "XXXX.",
        "X...X",
        "XXXX.",
        "X..X.",
        "X...X"
    ],
    'A': [
        ".XXX.",
        "X...X",
        "XXXXX",
        "X...X",
        "X...X"
    ],
    'C': [
        ".XXXX",
        "X....",
        "X....",
        "X....",
        ".XXXX"
    ],
    'K': [
        "X...X",
        "X..X.",
        "XXX..",
        "X..X.",
        "X...X"
    ],
    'E': [
        "XXXXX",
        "X....",
        "XXXX.",
        "X....",
        "XXXXX"
    ]
}

def draw_block(x, y):
    # Using the animated gradient
    return f'<rect x="{x}" y="{y}" width="12" height="12" fill="url(#geminiGradient)" />'

word = "TRACKER"
cell_size = 16

current_x = 0
svg_blocks = []

for letter_char in word:
    pattern = letters[letter_char]
    height = len(pattern)
    width = len(pattern[0])
    
    for r, row in enumerate(pattern):
        for c, val in enumerate(row):
            if val == 'X':
                x = current_x + c * cell_size
                y = r * cell_size
                svg_blocks.append(draw_block(x, y))
                
    current_x += (width * cell_size) + 16

total_width = current_x - 16
total_height = 5 * cell_size

svg_content = f"""<svg width="100%" height="100%" viewBox="-10 -10 {total_width + 20} {total_height + 20}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="geminiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4285F4">
        <animate attributeName="stop-color" values="#4285F4;#9b72cb;#EA4335;#FBBC04;#4285F4" dur="5s" repeatCount="indefinite" />
      </stop>
      <stop offset="50%" stop-color="#9b72cb">
        <animate attributeName="stop-color" values="#9b72cb;#EA4335;#FBBC04;#4285F4;#9b72cb" dur="5s" repeatCount="indefinite" />
      </stop>
      <stop offset="100%" stop-color="#EA4335">
        <animate attributeName="stop-color" values="#EA4335;#FBBC04;#4285F4;#9b72cb;#EA4335" dur="5s" repeatCount="indefinite" />
      </stop>
    </linearGradient>
  </defs>
  <g class="blocks">
    {''.join(svg_blocks)}
  </g>
</svg>"""

with open('logo.svg', 'w') as f:
    f.write(svg_content)
