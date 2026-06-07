const canvas = document.querySelector("[data-solar-system]");

if (canvas) {
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const center = { x: width * 0.5, y: height * 0.54 };
  let time = 0;
  const earthOrbitalSpeed = 0.00115;
  const moonOrbitalSpeed = earthOrbitalSpeed * 13.37;
  const signalFromMoonColor = "rgba(155, 220, 255, 0.94)";
  const signalFromEarthColor = "rgba(255, 159, 82, 0.94)";
  const signalCycle = 220;
  const signalDuration = 72;
  const activeSignals = [];
  let lastSignalCycle = -1;

  function orbitalSpeed(periodYears) {
    return earthOrbitalSpeed / periodYears;
  }

  const planets = [
    {
      name: "MERCURY",
      orbit: [54, 22],
      radius: 4,
      speed: orbitalSpeed(0.2408467),
      phase: 0.4,
      color: "rgba(190, 183, 170, 0.92)",
    },
    {
      name: "VENUS",
      orbit: [82, 34],
      radius: 7,
      speed: orbitalSpeed(0.615197),
      phase: 1.6,
      color: "rgba(229, 186, 109, 0.94)",
    },
    {
      name: "EARTH",
      orbit: [116, 48],
      radius: 9,
      speed: orbitalSpeed(1),
      phase: 2.5,
      color: "rgba(55, 130, 190, 0.94)",
      moon: true,
    },
    {
      name: "MARS",
      orbit: [152, 64],
      radius: 8,
      speed: orbitalSpeed(1.8808),
      phase: 4.1,
      color: "rgba(255, 118, 80, 0.92)",
    },
    {
      name: "JUPITER",
      orbit: [218, 92],
      radius: 17,
      speed: orbitalSpeed(11.862),
      phase: 5.2,
      color: "rgba(218, 177, 132, 0.94)",
      bands: ["rgba(150, 95, 70, 0.72)", "rgba(245, 218, 174, 0.6)"],
    },
    {
      name: "SATURN",
      orbit: [292, 122],
      radius: 14,
      speed: orbitalSpeed(29.457),
      phase: 0.8,
      color: "rgba(224, 196, 132, 0.94)",
      rings: true,
    },
    {
      name: "URANUS",
      orbit: [360, 150],
      radius: 10,
      speed: orbitalSpeed(84.0168),
      phase: 2.9,
      color: "rgba(130, 225, 222, 0.88)",
    },
    {
      name: "NEPTUNE",
      orbit: [424, 176],
      radius: 10,
      speed: orbitalSpeed(164.8),
      phase: 4.4,
      color: "rgba(88, 143, 255, 0.88)",
    },
  ];

  function pixelRect(x, y, size, color) {
    context.fillStyle = color;
    context.fillRect(Math.round(x), Math.round(y), size, size);
  }

  function drawPixelCircle(x, y, radius, color) {
    const step = 1;
    for (let py = -radius; py <= radius; py += step) {
      for (let px = -radius; px <= radius; px += step) {
        if (px * px + py * py <= radius * radius) {
          pixelRect(x + px, y + py, step, color);
        }
      }
    }
  }

  function drawPixelEllipse(x, y, rx, ry, color) {
    for (let py = -ry; py <= ry; py += 1) {
      for (let px = -rx; px <= rx; px += 1) {
        if ((px * px) / (rx * rx) + (py * py) / (ry * ry) <= 1) {
          pixelRect(x + px, y + py, 1, color);
        }
      }
    }
  }

  function drawSun(x, y, radius) {
    const rotation = -time * 0.01;

    for (let py = -radius; py <= radius; py += 1) {
      for (let px = -radius; px <= radius; px += 1) {
        const distSquared = px * px + py * py;
        if (distSquared <= radius * radius) {
          const nx = px / radius;
          const ny = py / radius;
          const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
          const longitude = Math.atan2(nx, nz) + rotation;
          const latitude = Math.asin(Math.max(-1, Math.min(1, ny)));
          const granule =
            Math.sin(longitude * 5.5) * 0.45 +
            Math.sin(longitude * 11 + latitude * 4) * 0.25 +
            Math.cos(latitude * 7 + longitude * 2.5) * 0.2;
          const dist = Math.sqrt(distSquared) / radius;
          const limb = 1 - dist * 0.18;

          let red = 255 + granule * 14;
          let green = 155 + granule * 22;
          let blue = 75 + granule * 10;

          red = Math.round(red * limb);
          green = Math.round(Math.min(215, green * limb));
          blue = Math.round(Math.max(45, blue * limb));

          pixelRect(x + px, y + py, 1, `rgba(${red}, ${green}, ${blue}, 0.96)`);
        }
      }
    }
  }

  function drawOrbit(rx, ry, color) {
    context.strokeStyle = color;
    context.lineWidth = 1.4;
    context.setLineDash([5, 7]);
    context.beginPath();
    context.ellipse(center.x, center.y, rx, ry, 0, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);
  }

  function orbitPoint(rx, ry, angle) {
    return {
      x: center.x + Math.cos(angle) * rx,
      y: center.y + Math.sin(angle) * ry,
    };
  }

  function drawLabel(text, x, y, color) {
    context.font = "11px Ubuntu Mono, SFMono-Regular, Menlo, Consolas, monospace";
    context.fillStyle = color;
    context.fillText(text, Math.round(x), Math.round(y));
  }

  function drawStars() {
    for (let index = 0; index < 82; index += 1) {
      const x = (index * 97) % width;
      const y = (index * 53) % height;
      const flicker = 0.18 + Math.sin(time * 0.01 + index) * 0.1;
      pixelRect(x, y, 2, `rgba(245,245,245,${flicker})`);
    }
  }

  function drawAsteroidBelt() {
    for (let index = 0; index < 96; index += 1) {
      const angle = index * 0.39 + time * 0.0009;
      const wobble = Math.sin(index * 1.7) * 8;
      const rx = 181 + wobble;
      const ry = 76 + Math.cos(index * 1.2) * 4;
      const point = orbitPoint(rx, ry, angle);
      const alpha = 0.28 + (index % 5) * 0.035;
      pixelRect(point.x, point.y, 2, `rgba(220, 232, 238, ${alpha})`);
    }
  }

  function drawSaturnRings(x, y) {
    context.strokeStyle = "rgba(231, 214, 164, 0.68)";
    context.lineWidth = 2;
    context.beginPath();
    context.ellipse(x, y, 26, 8, -0.18, 0, Math.PI * 2);
    context.stroke();
    context.strokeStyle = "rgba(155, 220, 255, 0.22)";
    context.lineWidth = 1;
    context.beginPath();
    context.ellipse(x, y, 32, 11, -0.18, 0, Math.PI * 2);
    context.stroke();
  }

  function drawJupiterBands(x, y, planet) {
    context.save();
    context.beginPath();
    context.arc(x, y, planet.radius + 1, 0, Math.PI * 2);
    context.clip();
    pixelRect(x - 15, y - 7, 31, 2, planet.bands[0]);
    pixelRect(x - 16, y - 2, 33, 2, "rgba(255, 236, 196, 0.48)");
    pixelRect(x - 15, y + 4, 31, 2, planet.bands[1]);
    drawPixelEllipse(x + 7, y + 7, 4, 3, "rgba(178, 81, 58, 0.82)");
    drawPixelEllipse(x + 8, y + 6, 2, 1, "rgba(255, 185, 128, 0.65)");
    context.restore();
  }

  function drawEarth(x, y, radius) {
    const ocean = "rgba(42, 105, 165, 0.96)";
    const land = "rgba(82, 178, 92, 1)";
    const cloud = "rgba(240, 248, 252, 0.5)";

    for (let py = -radius; py <= radius; py += 1) {
      for (let px = -radius; px <= radius; px += 1) {
        if (px * px + py * py <= radius * radius) {
          const isLand =
            (px >= -7 && px <= -1 && py >= -4 && py <= 4) ||
            (px >= -8 && px <= -4 && py >= 3 && py <= 6) ||
            (px >= 1 && px <= 7 && py >= -5 && py <= 2) ||
            (px >= 0 && px <= 5 && py >= 2 && py <= 5);
          pixelRect(x + px, y + py, 1, isLand ? land : ocean);
        }
      }
    }

    pixelRect(x - 2, y - 8, 4, 2, cloud);
    pixelRect(x + 3, y - 5, 3, 2, cloud);
  }

  function moonPosition(earth) {
    return {
      x: earth.x + Math.cos(time * moonOrbitalSpeed) * 19,
      y: earth.y + Math.sin(time * moonOrbitalSpeed) * 10,
    };
  }

  function queueSignals() {
    const cycle = Math.floor(time / signalCycle);
    if (cycle === lastSignalCycle) {
      return;
    }

    lastSignalCycle = cycle;

    activeSignals.push({
      direction: cycle % 2 === 0 ? "earthToMoon" : "moonToEarth",
      color: cycle % 2 === 0 ? signalFromEarthColor : signalFromMoonColor,
      age: 0,
    });
  }

  function drawSignalTrail(signal, earth, moon) {
    const from = signal.direction === "earthToMoon" ? earth : moon;
    const to = signal.direction === "earthToMoon" ? moon : earth;
    const progress = Math.min(signal.age / signalDuration, 1);
    const trailLength = 5;

    for (let index = 0; index < trailLength; index += 1) {
      const trailProgress = Math.max(0, progress - index * 0.05);
      const x = from.x + (to.x - from.x) * trailProgress;
      const y = from.y + (to.y - from.y) * trailProgress;
      const alpha = 0.95 - index * 0.16;

      pixelRect(x - 1, y - 1, 2, signal.color.replace(/[\d.]+\)$/, `${alpha})`));
    }
  }

  function updateSignals() {
    for (let index = activeSignals.length - 1; index >= 0; index -= 1) {
      activeSignals[index].age += 1;
      if (activeSignals[index].age > signalDuration + 8) {
        activeSignals.splice(index, 1);
      }
    }
  }

  function drawMoon(earth) {
    const moon = moonPosition(earth);
    const moonColor = "rgba(220, 232, 238, 0.88)";
    const moonShadow = "rgba(180, 190, 198, 0.78)";

    context.strokeStyle = "rgba(245,245,245,0.18)";
    context.lineWidth = 1;
    context.beginPath();
    context.ellipse(earth.x, earth.y, 19, 10, 0, 0, Math.PI * 2);
    context.stroke();

    drawPixelCircle(moon.x, moon.y, 4, moonColor);
    pixelRect(moon.x + 1, moon.y - 1, 1, 1, moonShadow);
    pixelRect(moon.x - 2, moon.y + 1, 1, 1, moonShadow);
    pixelRect(moon.x, moon.y + 2, 1, 1, moonShadow);

    drawLabel("MOON", moon.x + 8, moon.y - 8, "rgba(155, 220, 255, 0.88)");

    return moon;
  }

  function draw() {
    time += 1;
    context.fillStyle = "#030303";
    context.fillRect(0, 0, width, height);

    drawStars();
    planets.forEach((planet) => {
      drawOrbit(planet.orbit[0], planet.orbit[1], "rgba(220, 232, 238, 0.26)");
    });
    drawAsteroidBelt();

    drawSun(center.x, center.y, 23);
    drawLabel("SUN", center.x - 10, center.y + 45, "rgba(220, 232, 238, 0.66)");

    let earthPosition = null;
    let moonPositionPoint = null;

    planets.forEach((planet) => {
      const position = orbitPoint(planet.orbit[0], planet.orbit[1], time * planet.speed + planet.phase);

      if (planet.rings) {
        drawSaturnRings(position.x, position.y);
      }

      if (planet.moon) {
        drawEarth(position.x, position.y, planet.radius);
      } else {
        drawPixelCircle(position.x, position.y, planet.radius, planet.color);
      }

      if (planet.bands) {
        drawJupiterBands(position.x, position.y, planet);
      }

      if (planet.moon) {
        earthPosition = position;
        moonPositionPoint = drawMoon(position);
      }

      const labelOffset = planet.name === "SATURN" ? 34 : planet.radius + 8;
      const labelColor = planet.name === "EARTH" ? "rgba(255, 159, 82, 0.88)" : "rgba(220, 232, 238, 0.66)";
      drawLabel(planet.name, position.x + labelOffset, position.y + 4, labelColor);
    });

    if (earthPosition && moonPositionPoint) {
      queueSignals();
      activeSignals.forEach((signal) => drawSignalTrail(signal, earthPosition, moonPositionPoint));
      updateSignals();
    }

    window.requestAnimationFrame(draw);
  }

  draw();
}
