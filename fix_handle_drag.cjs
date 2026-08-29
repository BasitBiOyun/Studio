const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'InteractiveCanvas.tsx');
let code = fs.readFileSync(file, 'utf8');

const newHandleDrag = `
  const handleDrag = (e: any) => {
    const target = e.target as HTMLElement;
    const moveableId = target.getAttribute('data-moveable-id');
    if (!moveableId) return;

    if (moveableId.startsWith('logo-')) {
      // Logos use absolute positioning with x/y as px offsets.
      // right = defaultRight - x, top = defaultTop + y
      // So if dragging, +dx means moving right -> -x needs to increase? 
      // dx is movement in px. If it moves right, dx > 0.
      // logo.x is subtracted from right, so logo.x controls moving left.
      // To move right (+dx), logo.x should decrease by dx.
      // To move down (+dy), logo.y should increase by dy.
      
      const currentX = parseFloat(target.getAttribute('data-x') || '0');
      const currentY = parseFloat(target.getAttribute('data-y') || '0');
      
      const newX = currentX - e.delta[0];
      const newY = currentY + e.delta[1];
      
      target.setAttribute('data-x', newX.toString());
      target.setAttribute('data-y', newY.toString());
      
      // Update inline style 
      // Because we used \`right\` and \`top\`, we can just override transform temporarily for smoothness,
      // or directly update right/top.
      // But we have \`e.transform\` which is a translate(). We can just let Moveable apply it for the frame,
      // but the initial state didn't have translate! 
      // Actually, e.transform will accumulate translate() on top of the initial right/top.
      target.style.transform = e.transform;
      
    } else {
      // Images use percentage translate
      const parent = target.parentElement;
      if (!parent) return;
      const pw = parent.offsetWidth;
      const ph = parent.offsetHeight;
      
      const dx = (e.delta[0] / pw) * 100;
      const dy = (e.delta[1] / ph) * 100;
      
      const currentX = parseFloat(target.getAttribute('data-x') || '0');
      const currentY = parseFloat(target.getAttribute('data-y') || '0');
      
      const newX = currentX + dx;
      const newY = currentY + dy;
      
      target.setAttribute('data-x', newX.toFixed(2));
      target.setAttribute('data-y', newY.toFixed(2));
      
      const scale = target.getAttribute('data-scale') || '1';
      target.style.transform = \`translate(\${newX}%, \${newY}%) scale(\${scale})\`;
    }
  };
`;

code = code.replace(/const handleDrag = \(e: any\) => \{[\s\S]*?\};/m, newHandleDrag.trim());

const updateProjectLogo = `
    } else if (id.startsWith('logo-')) {
      const idxStr = id.replace('logo-', '');
      const logo = template.visuals.logos.find((l: any, idx: number) => (l.id || idx).toString() === idxStr);
      if (logo) {
        logo.x = x;
        logo.y = y;
        // The inline style transform must be reset because we save it to x/y which affects top/right
        target.style.transform = '';
      }
    }
`;

code = code.replace(/\} else if \(id\.startsWith\('logo-'\)\) \{[\s\S]*?\}\n\s*\}/m, updateProjectLogo.trim());

fs.writeFileSync(file, code);
