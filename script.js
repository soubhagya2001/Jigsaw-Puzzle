"use strict";

let puzzle;

const mhypot = Math.hypot,
  mrandom = Math.random,
  mmax = Math.max,
  mmin = Math.min,
  mround = Math.round,
  mfloor = Math.floor,
  msqrt = Math.sqrt,
  mabs = Math.abs;

function isMiniature() {
  return location.pathname.includes("/fullcpgrid/");
}

function alea(min, max) {
  if (typeof max == "undefined") return min * mrandom();
  return min + (max - min) * mrandom();
}

function intAlea(min, max) {
  if (typeof max == "undefined") {
    max = min;
    min = 0;
  }
  return mfloor(min + (max - min) * mrandom());
}

function arrayShuffle(array) {
  let k1, temp;
  for (let k = array.length - 1; k >= 1; --k) {
    k1 = intAlea(0, k + 1);
    temp = array[k];
    array[k] = array[k1];
    array[k1] = temp;
  }
  return array;
}

class Point {
  constructor(x, y) {
    this.x = Number(x);
    this.y = Number(y);
  }
  copy() {
    return new Point(this.x, this.y);
  }
  distance(otherPoint) {
    return mhypot(this.x - otherPoint.x, this.y - otherPoint.y);
  }
}

class Segment {
  constructor(p1, p2) {
    this.p1 = new Point(p1.x, p1.y);
    this.p2 = new Point(p2.x, p2.y);
  }
  dx() {
    return this.p2.x - this.p1.x;
  }
  dy() {
    return this.p2.y - this.p1.y;
  }
  length() {
    return mhypot(this.dx(), this.dy());
  }
  pointOnRelative(coeff) {
    let dx = this.dx();
    let dy = this.dy();
    return new Point(this.p1.x + coeff * dx, this.p1.y + coeff * dy);
  }
}

class Side {
  constructor() {
    this.type = "";
    this.points = [];
  }
  reversed() {
    const ns = new Side();
    ns.type = this.type;
    ns.points = this.points.slice().reverse();
    return ns;
  }
  scale(puzzle) {
    const coefx = puzzle.scalex;
    const coefy = puzzle.scaley;
    this.scaledPoints = this.points.map(
      (p) => new Point(p.x * coefx, p.y * coefy)
    );
  }
  drawPath(ctx, shiftx, shifty, withoutMoveTo) {
    if (!withoutMoveTo) {
      ctx.moveTo(
        this.scaledPoints[0].x + shiftx,
        this.scaledPoints[0].y + shifty
      );
    }
    if (this.type == "d") {
      ctx.lineTo(
        this.scaledPoints[1].x + shiftx,
        this.scaledPoints[1].y + shifty
      );
    } else {
      for (let k = 1; k < this.scaledPoints.length - 1; k += 3) {
        ctx.bezierCurveTo(
          this.scaledPoints[k].x + shiftx,
          this.scaledPoints[k].y + shifty,
          this.scaledPoints[k + 1].x + shiftx,
          this.scaledPoints[k + 1].y + shifty,
          this.scaledPoints[k + 2].x + shiftx,
          this.scaledPoints[k + 2].y + shifty
        );
      }
    }
  }
}

function twist0(side, ca, cb) {
  const seg0 = new Segment(side.points[0], side.points[1]);
  const dxh = seg0.dx(),
    dyh = seg0.dy();
  const seg1 = new Segment(ca, cb);
  const mid0 = seg0.pointOnRelative(0.5),
    mid1 = seg1.pointOnRelative(0.5);
  const segMid = new Segment(mid0, mid1);
  const dxv = segMid.dx(),
    dyv = segMid.dy();
  const scalex = alea(0.8, 1),
    scaley = alea(0.9, 1),
    mid = alea(0.45, 0.55);
  const pa = pointAt(mid - (1 / 12) * scalex, (1 / 12) * scaley);
  const pb = pointAt(mid - (2 / 12) * scalex, (3 / 12) * scaley);
  const pc = pointAt(mid, (4 / 12) * scaley);
  const pd = pointAt(mid + (2 / 12) * scalex, (3 / 12) * scaley);
  const pe = pointAt(mid + (1 / 12) * scalex, (1 / 12) * scaley);

  side.points = [
    seg0.p1,
    new Point(
      seg0.p1.x + (5 / 12) * dxh * 0.52,
      seg0.p1.y + (5 / 12) * dyh * 0.52
    ),
    new Point(pa.x - (1 / 12) * dxv * 0.72, pa.y - (1 / 12) * dyv * 0.72),
    pa,
    new Point(pa.x + (1 / 12) * dxv * 0.72, pa.y + (1 / 12) * dyv * 0.72),
    new Point(pb.x - (1 / 12) * dxv * 0.92, pb.y - (1 / 12) * dyv * 0.92),
    pb,
    new Point(pb.x + (1 / 12) * dxv * 0.52, pb.y + (1 / 12) * dyv * 0.52),
    new Point(pc.x - (2 / 12) * dxh * 0.4, pc.y - (2 / 12) * dyh * 0.4),
    pc,
    new Point(pc.x + (2 / 12) * dxh * 0.4, pc.y + (2 / 12) * dyh * 0.4),
    new Point(pd.x + (1 / 12) * dxv * 0.52, pd.y + (1 / 12) * dyv * 0.52),
    pd,
    new Point(pd.x - (1 / 12) * dxv * 0.92, pd.y - (1 / 12) * dyv * 0.92),
    new Point(pe.x + (1 / 12) * dxv * 0.72, pe.y + (1 / 12) * dyv * 0.72),
    pe,
    new Point(pe.x - (1 / 12) * dxv * 0.72, pe.y - (1 / 12) * dyv * 0.72),
    new Point(
      seg0.p2.x - (5 / 12) * dxh * 0.52,
      seg0.p2.y - (5 / 12) * dyh * 0.52
    ),
    seg0.p2,
  ];
  side.type = "z";

  function pointAt(coeffh, coeffv) {
    return new Point(
      seg0.p1.x + coeffh * dxh + coeffv * dxv,
      seg0.p1.y + coeffh * dyh + coeffv * dyv
    );
  }
}

function twist1(side, ca, cb) {
  const seg0 = new Segment(side.points[0], side.points[1]);
  const dxh = seg0.dx(),
    dyh = seg0.dy();
  const seg1 = new Segment(ca, cb);
  const mid0 = seg0.pointOnRelative(0.5),
    mid1 = seg1.pointOnRelative(0.5);
  const segMid = new Segment(mid0, mid1);
  const dxv = segMid.dx(),
    dyv = segMid.dy();
  const pa = pointAt(alea(0.3, 0.35), alea(-0.05, 0.05));
  const pb = pointAt(alea(0.45, 0.55), alea(0.2, 0.3));
  const pc = pointAt(alea(0.65, 0.78), alea(-0.05, 0.05));

  side.points = [
    seg0.p1,
    seg0.p1,
    pa,
    pa,
    pa,
    pb,
    pb,
    pb,
    pc,
    pc,
    pc,
    seg0.p2,
    seg0.p2,
  ];
  side.type = "z";

  function pointAt(coeffh, coeffv) {
    return new Point(
      seg0.p1.x + coeffh * dxh + coeffv * dxv,
      seg0.p1.y + coeffh * dyh + coeffv * dyv
    );
  }
}

function twist2(side, ca, cb) {
  const seg0 = new Segment(side.points[0], side.points[1]);
  const dxh = seg0.dx(),
    dyh = seg0.dy();
  const seg1 = new Segment(ca, cb);
  const mid0 = seg0.pointOnRelative(0.5),
    mid1 = seg1.pointOnRelative(0.5);
  const segMid = new Segment(mid0, mid1);
  const dxv = segMid.dx(),
    dyv = segMid.dy();
  const hmid = alea(0.45, 0.55),
    vmid = alea(0.4, 0.5);
  const pc = pointAt(hmid, vmid);
  let sega = new Segment(seg0.p1, pc);
  const pb = sega.pointOnRelative(2 / 3);
  sega = new Segment(seg0.p2, pc);
  const pd = sega.pointOnRelative(2 / 3);

  side.points = [seg0.p1, pb, pd, seg0.p2];
  side.type = "z";

  function pointAt(coeffh, coeffv) {
    return new Point(
      seg0.p1.x + coeffh * dxh + coeffv * dxv,
      seg0.p1.y + coeffh * dyh + coeffv * dyv
    );
  }
}

function twist3(side, ca, cb) {
  side.points = [side.points[0], side.points[1]];
}

class Piece {
  constructor(kx, ky) {
    this.ts = new Side();
    this.rs = new Side();
    this.bs = new Side();
    this.ls = new Side();
    this.kx = kx;
    this.ky = ky;
  }
  scale(puzzle) {
    this.ts.scale(puzzle);
    this.rs.scale(puzzle);
    this.bs.scale(puzzle);
    this.ls.scale(puzzle);
  }
}

class PolyPiece {
  constructor(initialPiece, puzzle) {
    this.pckxmin = initialPiece.kx;
    this.pckxmax = initialPiece.kx + 1;
    this.pckymin = initialPiece.ky;
    this.pckymax = initialPiece.ky + 1;
    this.pieces = [initialPiece];
    this.puzzle = puzzle;
    this.listLoops();
    this.canvas = document.createElement("CANVAS");
    puzzle.container.appendChild(this.canvas);
    this.canvas.classList.add("polypiece");
    this.ctx = this.canvas.getContext("2d");
  }

  merge(otherPoly) {
    const orgpckxmin = this.pckxmin,
      orgpckymin = this.pckymin;
    const kOther = this.puzzle.polyPieces.indexOf(otherPoly);
    this.puzzle.polyPieces.splice(kOther, 1);
    this.puzzle.container.removeChild(otherPoly.canvas);

    for (let k = 0; k < otherPoly.pieces.length; ++k) {
      this.pieces.push(otherPoly.pieces[k]);
      if (otherPoly.pieces[k].kx < this.pckxmin)
        this.pckxmin = otherPoly.pieces[k].kx;
      if (otherPoly.pieces[k].kx + 1 > this.pckxmax)
        this.pckxmax = otherPoly.pieces[k].kx + 1;
      if (otherPoly.pieces[k].ky < this.pckymin)
        this.pckymin = otherPoly.pieces[k].ky;
      if (otherPoly.pieces[k].ky + 1 > this.pckymax)
        this.pckymax = otherPoly.pieces[k].ky + 1;
    }

    this.pieces.sort((p1, p2) =>
      p1.ky < p2.ky ? -1 : p1.ky > p2.ky ? 1 : p1.kx < p2.kx ? -1 : 1
    );
    this.listLoops();
    this.drawImage();
    this.moveTo(
      this.x + this.puzzle.scalex * (this.pckxmin - orgpckxmin),
      this.y + this.puzzle.scaley * (this.pckymin - orgpckymin)
    );
    this.puzzle.evaluateZIndex();
  }

  ifNear(otherPoly) {
    let puzzle = this.puzzle;
    let x = this.x - puzzle.scalex * this.pckxmin,
      y = this.y - puzzle.scaley * this.pckymin;
    let ppx = otherPoly.x - puzzle.scalex * otherPoly.pckxmin,
      ppy = otherPoly.y - puzzle.scaley * otherPoly.pckymin;
    if (mhypot(x - ppx, y - ppy) >= puzzle.dConnect) return false;

    for (let k = this.pieces.length - 1; k >= 0; --k) {
      let p1 = this.pieces[k];
      for (let ko = otherPoly.pieces.length - 1; ko >= 0; --ko) {
        let p2 = otherPoly.pieces[ko];
        if (p1.kx == p2.kx && mabs(p1.ky - p2.ky) == 1) return true;
        if (p1.ky == p2.ky && mabs(p1.kx - p2.kx) == 1) return true;
      }
    }
    return false;
  }

  listLoops() {
    const that = this;
    function edgeIsCommon(kx, ky, edge) {
      switch (edge) {
        case 0:
          ky--;
          break;
        case 1:
          kx++;
          break;
        case 2:
          ky++;
          break;
        case 3:
          kx--;
          break;
      }
      for (let k = 0; k < that.pieces.length; k++) {
        if (kx == that.pieces[k].kx && ky == that.pieces[k].ky) return true;
      }
      return false;
    }

    function edgeIsInTbEdges(kx, ky, edge) {
      for (let k = 0; k < tbEdges.length; k++) {
        if (
          kx == tbEdges[k].kx &&
          ky == tbEdges[k].ky &&
          edge == tbEdges[k].edge
        )
          return k;
      }
      return false;
    }

    let tbLoops = [],
      tbEdges = [];
    for (let k = 0; k < this.pieces.length; k++) {
      for (let kEdge = 0; kEdge < 4; kEdge++) {
        if (!edgeIsCommon(this.pieces[k].kx, this.pieces[k].ky, kEdge))
          tbEdges.push({
            kx: this.pieces[k].kx,
            ky: this.pieces[k].ky,
            edge: kEdge,
            kp: k,
          });
      }
    }

    const tbTries = [
      [
        { dkx: 0, dky: 0, edge: 1 },
        { dkx: 1, dky: 0, edge: 0 },
        { dkx: 1, dky: -1, edge: 3 },
      ],
      [
        { dkx: 0, dky: 0, edge: 2 },
        { dkx: 0, dky: 1, edge: 1 },
        { dkx: 1, dky: 1, edge: 0 },
      ],
      [
        { dkx: 0, dky: 0, edge: 3 },
        { dkx: -1, dky: 0, edge: 2 },
        { dkx: -1, dky: 1, edge: 1 },
      ],
      [
        { dkx: 0, dky: 0, edge: 0 },
        { dkx: 0, dky: -1, edge: 3 },
        { dkx: -1, dky: -1, edge: 2 },
      ],
    ];

    while (tbEdges.length > 0) {
      let lp = [],
        currEdge = tbEdges[0];
      lp.push(currEdge);
      tbEdges.splice(0, 1);
      do {
        let edgeNumber = false;
        for (let tries = 0; tries < 3; tries++) {
          let potNext = tbTries[currEdge.edge][tries];
          edgeNumber = edgeIsInTbEdges(
            currEdge.kx + potNext.dkx,
            currEdge.ky + potNext.dky,
            potNext.edge
          );
          if (edgeNumber !== false) {
            currEdge = tbEdges[edgeNumber];
            lp.push(currEdge);
            tbEdges.splice(edgeNumber, 1);
            break;
          }
        }
        if (edgeNumber === false) break;
      } while (true);
      tbLoops.push(lp);
    }

    this.tbLoops = tbLoops.map((loop) =>
      loop.map((edge) => {
        let cell = this.pieces[edge.kp];
        return edge.edge == 0
          ? cell.ts
          : edge.edge == 1
          ? cell.rs
          : edge.edge == 2
          ? cell.bs
          : cell.ls;
      })
    );
  }

  drawPath(ctx, shiftx, shifty) {
    this.tbLoops.forEach((loop) => {
      let without = false;
      loop.forEach((side) => {
        side.drawPath(ctx, shiftx, shifty, without);
        without = true;
      });
      ctx.closePath();
    });
  }

  drawImage() {
    puzzle = this.puzzle;
    this.nx = this.pckxmax - this.pckxmin + 1;
    this.ny = this.pckymax - this.pckymin + 1;
    this.canvas.width = this.nx * puzzle.scalex;
    this.canvas.height = this.ny * puzzle.scaley;
    this.offsx = (this.pckxmin - 0.5) * puzzle.scalex;
    this.offsy = (this.pckymin - 0.5) * puzzle.scaley;

    this.path = new Path2D();
    this.drawPath(this.path, -this.offsx, -this.offsy);
    this.ctx.fillStyle = "none";
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    this.ctx.shadowBlur = 4;
    this.ctx.shadowOffsetX = 4;
    this.ctx.shadowOffsetY = 4;
    this.ctx.fill(this.path);
    this.ctx.shadowColor = "rgba(0, 0, 0, 0)";

    this.pieces.forEach((pp) => {
      this.ctx.save();
      const path = new Path2D();
      const shiftx = -this.offsx,
        shifty = -this.offsy;
      pp.ts.drawPath(path, shiftx, shifty, false);
      pp.rs.drawPath(path, shiftx, shifty, true);
      pp.bs.drawPath(path, shiftx, shifty, true);
      pp.ls.drawPath(path, shiftx, shifty, true);
      path.closePath();

      this.ctx.clip(path);
      const srcx = pp.kx ? (pp.kx - 0.5) * puzzle.scalex : 0;
      const srcy = pp.ky ? (pp.ky - 0.5) * puzzle.scaley : 0;
      const destx =
        (pp.kx ? 0 : puzzle.scalex / 2) +
        (pp.kx - this.pckxmin) * puzzle.scalex;
      const desty =
        (pp.ky ? 0 : puzzle.scaley / 2) +
        (pp.ky - this.pckymin) * puzzle.scaley;
      let w = 2 * puzzle.scalex,
        h = 2 * puzzle.scaley;
      if (srcx + w > puzzle.gameCanvas.width)
        w = puzzle.gameCanvas.width - srcx;
      if (srcy + h > puzzle.gameCanvas.height)
        h = puzzle.gameCanvas.height - srcy;

      this.ctx.drawImage(
        puzzle.gameCanvas,
        srcx,
        srcy,
        w,
        h,
        destx,
        desty,
        w,
        h
      );
      this.ctx.translate(
        puzzle.embossThickness / 2,
        -puzzle.embossThickness / 2
      );
      this.ctx.lineWidth = puzzle.embossThickness;
      this.ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
      this.ctx.stroke(path);
      this.ctx.translate(-puzzle.embossThickness, puzzle.embossThickness);
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      this.ctx.stroke(path);
      this.ctx.restore();
    });
  }

  moveTo(x, y) {
    this.x = x;
    this.y = y;
    this.canvas.style.left = x + "px";
    this.canvas.style.top = y + "px";
  }

  moveToInitialPlace() {
    const puzzle = this.puzzle;
    this.moveTo(
      puzzle.offsx + (this.pckxmin - 0.5) * puzzle.scalex,
      puzzle.offsy + (this.pckymin - 0.5) * puzzle.scaley
    );
  }
}

class Puzzle {
  constructor(params) {
    this.container =
      typeof params.container == "string"
        ? document.getElementById(params.container)
        : params.container;
    this.container.addEventListener("mousedown", (event) => {
      event.preventDefault();
      events.push({
        event: "touch",
        position: this.relativeMouseCoordinates(event),
      });
    });
    this.container.addEventListener(
      "touchstart",
      (event) => {
        event.preventDefault();
        if (event.touches.length != 1) return;
        events.push({
          event: "touch",
          position: this.relativeMouseCoordinates(event.touches[0]),
        });
      },
      { passive: false }
    );

    this.container.addEventListener("mouseup", () =>
      events.push({ event: "leave" })
    );
    this.container.addEventListener("touchend", () =>
      events.push({ event: "leave" })
    );
    this.container.addEventListener("touchleave", () =>
      events.push({ event: "leave" })
    );
    this.container.addEventListener("touchcancel", () =>
      events.push({ event: "leave" })
    );

    this.container.addEventListener("mousemove", (event) => {
      event.preventDefault();
      if (events.length && events[events.length - 1].event == "move")
        events.pop();
      events.push({
        event: "move",
        position: this.relativeMouseCoordinates(event),
      });
    });
    this.container.addEventListener(
      "touchmove",
      (event) => {
        event.preventDefault();
        if (event.touches.length != 1) return;
        if (events.length && events[events.length - 1].event == "move")
          events.pop();
        events.push({
          event: "move",
          position: this.relativeMouseCoordinates(event.touches[0]),
        });
      },
      { passive: false }
    );

    this.gameCanvas = document.createElement("CANVAS");
    this.container.appendChild(this.gameCanvas);
    this.srcImage = new Image();
    this.imageLoaded = false;
    this.srcImage.addEventListener("load", () => {
      this.imageLoaded = true;
      events.push({ event: "srcImageLoaded" });
    });

    this.timer = null;
    this.timeElapsed = 0;
    this.isGameStarted = false;
  }

  startTimer() {
    this.timeElapsed = 0;
    document.getElementById("timer").style.display = "block";
    this.updateTimerDisplay();
    this.timer = setInterval(() => {
      this.timeElapsed++;
      this.updateTimerDisplay();
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timeElapsed / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (this.timeElapsed % 60).toString().padStart(2, "0");
    document.getElementById(
      "timer"
    ).textContent = `Time: ${minutes}:${seconds}`;
  }

  getContainerSize() {
    let styl = window.getComputedStyle(this.container);
    this.contWidth = parseFloat(styl.width);
    this.contHeight = parseFloat(styl.height);
  }

  create() {
    this.container.innerHTML = "";
    this.getContainerSize();
    this.computenxAndny();
    this.relativeHeight =
      this.srcImage.naturalHeight /
      this.ny /
      (this.srcImage.naturalWidth / this.nx);
    this.defineShapes({ coeffDecentr: 0.12, twistf: twist0 });
    this.polyPieces = [];
    this.pieces.forEach((row) =>
      row.forEach((piece) => this.polyPieces.push(new PolyPiece(piece, this)))
    );
    arrayShuffle(this.polyPieces);
    this.evaluateZIndex();
  }

  computenxAndny() {
    let width = this.srcImage.naturalWidth,
      height = this.srcImage.naturalHeight,
      npieces = this.nbPieces;
    let errmin = 1e9,
      nHPieces = mround(msqrt((npieces * width) / height)),
      nVPieces = mround(npieces / nHPieces);

    for (let ky = -2; ky <= 2; ky++) {
      let ncv = nVPieces + ky;
      for (let kx = -2; kx <= 2; kx++) {
        let nch = nHPieces + kx;
        let err = (nch * height) / ncv / width;
        err = err + 1 / err - 2 + mabs(1 - (nch * ncv) / npieces);
        if (err < errmin) {
          errmin = err;
          this.nx = nch;
          this.ny = ncv;
        }
      }
    }
  }

  defineShapes(shapeDesc) {
    let { coeffDecentr, twistf } = shapeDesc;
    const corners = [],
      nx = this.nx,
      ny = this.ny;

    for (let ky = 0; ky <= ny; ++ky) {
      corners[ky] = [];
      for (let kx = 0; kx <= nx; ++kx) {
        corners[ky][kx] = new Point(
          kx + alea(-coeffDecentr, coeffDecentr),
          ky + alea(-coeffDecentr, coeffDecentr)
        );
        if (kx == 0) corners[ky][kx].x = 0;
        if (kx == nx) corners[ky][kx].x = nx;
        if (ky == 0) corners[ky][kx].y = 0;
        if (ky == ny) corners[ky][kx].y = ny;
      }
    }

    this.pieces = [];
    for (let ky = 0; ky < ny; ++ky) {
      this.pieces[ky] = [];
      for (let kx = 0; kx < nx; ++kx) {
        this.pieces[ky][kx] = new Piece(kx, ky);
        let np = this.pieces[ky][kx];
        if (ky == 0) {
          np.ts.points = [corners[ky][kx], corners[ky][kx + 1]];
          np.ts.type = "d";
        } else {
          np.ts = this.pieces[ky - 1][kx].bs.reversed();
        }
        np.rs.points = [corners[ky][kx + 1], corners[ky + 1][kx + 1]];
        np.rs.type = "d";
        if (kx < nx - 1) {
          intAlea(2)
            ? twistf(np.rs, corners[ky][kx], corners[ky + 1][kx])
            : twistf(np.rs, corners[ky][kx + 2], corners[ky + 1][kx + 2]);
        }
        if (kx == 0) {
          np.ls.points = [corners[ky + 1][kx], corners[ky][kx]];
          np.ls.type = "d";
        } else {
          np.ls = this.pieces[ky][kx - 1].rs.reversed();
        }
        np.bs.points = [corners[ky + 1][kx + 1], corners[ky + 1][kx]];
        np.bs.type = "d";
        if (ky < ny - 1) {
          intAlea(2)
            ? twistf(np.bs, corners[ky][kx + 1], corners[ky][kx])
            : twistf(np.bs, corners[ky + 2][kx + 1], corners[ky + 2][kx]);
        }
      }
    }
  }

  scale() {
    const maxWidth = 0.95 * this.contWidth,
      maxHeight = 0.95 * this.contHeight;
    this.gameHeight = maxHeight;
    this.gameWidth =
      (this.gameHeight * this.srcImage.naturalWidth) /
      this.srcImage.naturalHeight;
    if (this.gameWidth > maxWidth) {
      this.gameWidth = maxWidth;
      this.gameHeight =
        (this.gameWidth * this.srcImage.naturalHeight) /
        this.srcImage.naturalWidth;
    }

    this.gameCanvas.width = this.gameWidth;
    this.gameCanvas.height = this.gameHeight;
    this.gameCtx = this.gameCanvas.getContext("2d");
    this.gameCtx.drawImage(
      this.srcImage,
      0,
      0,
      this.gameWidth,
      this.gameHeight
    );
    this.gameCanvas.classList.add("gameCanvas");
    this.gameCanvas.style.zIndex = 500;

    this.scalex = this.gameWidth / this.nx;
    this.scaley = this.gameHeight / this.ny;
    this.pieces.forEach((row) => row.forEach((piece) => piece.scale(this)));
    this.offsx = (this.contWidth - this.gameWidth) / 2;
    this.offsy = (this.contHeight - this.gameHeight) / 2;
    this.dConnect = mmax(10, mmin(this.scalex, this.scaley) / 10);
    this.embossThickness = mmin(2 + (this.scalex / 200) * (5 - 2), 5);
  }

  relativeMouseCoordinates(event) {
    const br = this.container.getBoundingClientRect();
    return { x: event.clientX - br.x, y: event.clientY - br.y };
  }

  limitRectangle(rect) {
    rect.x0 = mmin(
      mmax(rect.x0, -this.scalex / 2),
      this.contWidth - 1.5 * this.scalex
    );
    rect.x1 = mmin(
      mmax(rect.x1, -this.scalex / 2),
      this.contWidth - 1.5 * this.scalex
    );
    rect.y0 = mmin(
      mmax(rect.y0, -this.scaley / 2),
      this.contHeight - 1.5 * this.scaley
    );
    rect.y1 = mmin(
      mmax(rect.y1, -this.scaley / 2),
      this.contHeight - 1.5 * this.scaley
    );
  }

  spreadInRectangle(rect) {
    this.limitRectangle(rect);
    this.polyPieces.forEach((pp) =>
      pp.moveTo(alea(rect.x0, rect.x1), alea(rect.y0, rect.y1))
    );
  }

  optimInitial() {
    const minx = -this.scalex / 2,
      miny = -this.scaley / 2;
    const maxx = this.contWidth - 1.5 * this.scalex,
      maxy = this.contHeight - 1.5 * this.scaley;
    let freex = this.contWidth - this.gameWidth,
      freey = this.contHeight - this.gameHeight;
    let where = [0, 0, 0, 0],
      rects = [];

    if (freex > 1.5 * this.scalex) {
      where[1] = 1;
      rects[1] = {
        x0: this.gameWidth - 0.5 * this.scalex,
        x1: maxx,
        y0: miny,
        y1: maxy,
      };
    }
    if (freex > 3 * this.scalex) {
      where[3] = 1;
      rects[3] = {
        x0: minx,
        x1: freex / 2 - 1.5 * this.scalex,
        y0: miny,
        y1: maxy,
      };
      rects[1].x0 = this.contWidth - freex / 2 - 0.5 * this.scalex;
    }
    if (freey > 1.5 * this.scaley) {
      where[2] = 1;
      rects[2] = {
        x0: minx,
        x1: maxx,
        y0: this.gameHeight - 0.5 * this.scaley,
        y1: maxy,
      };
    }
    if (freey > 3 * this.scaley) {
      where[0] = 1;
      rects[0] = {
        x0: minx,
        x1: maxx,
        y0: miny,
        y1: freey / 2 - 1.5 * this.scaley,
      };
      rects[2].y0 = this.contHeight - freey / 2 - 0.5 * this.scaley;
    }

    if (where.reduce((sum, a) => sum + a) < 2) {
      if (freex - freey > 0.2 * this.scalex || where[1]) {
        this.spreadInRectangle({
          x0: this.gameWidth - this.scalex / 2,
          x1: maxx,
          y0: miny,
          y1: maxy,
        });
      } else if (freey - freex > 0.2 * this.scalex || where[2]) {
        this.spreadInRectangle({
          x0: minx,
          x1: maxx,
          y0: this.gameHeight - this.scaley / 2,
          y1: maxy,
        });
      } else {
        this.spreadInRectangle(
          this.gameWidth > this.gameHeight
            ? {
                x0: minx,
                x1: maxx,
                y0: this.gameHeight - this.scaley / 2,
                y1: maxy,
              }
            : {
                x0: this.gameWidth - this.scalex / 2,
                x1: maxx,
                y0: miny,
                y1: maxy,
              }
        );
      }
      return;
    }

    let nrects = rects.filter((r) => r);
    let k0 = 0,
      npTot = this.nx * this.ny;
    for (let k = 0; k < nrects.length; ++k) {
      let k1 = mround(((k + 1) / nrects.length) * npTot);
      this.spreadSetInRectangle(this.polyPieces.slice(k0, k1), nrects[k]);
      k0 = k1;
    }
    arrayShuffle(this.polyPieces);
    this.evaluateZIndex();
  }

  spreadSetInRectangle(set, rect) {
    this.limitRectangle(rect);
    set.forEach((pp) =>
      pp.moveTo(alea(rect.x0, rect.x1), alea(rect.y0, rect.y1))
    );
  }

  evaluateZIndex() {
    for (let k = this.polyPieces.length - 1; k > 0; --k) {
      if (
        this.polyPieces[k].pieces.length > this.polyPieces[k - 1].pieces.length
      ) {
        [this.polyPieces[k], this.polyPieces[k - 1]] = [
          this.polyPieces[k - 1],
          this.polyPieces[k],
        ];
      }
    }
    this.polyPieces.forEach((pp, k) => (pp.canvas.style.zIndex = k + 10));
    this.zIndexSup = this.polyPieces.length + 10;
  }

  resetGame() {
    this.stopTimer();
    this.isGameStarted = false;
    document.getElementById("timer").style.display = "none";
    this.container.innerHTML = "";
    events.push({ event: "reset" });
  }

  giveUp() {
    this.stopTimer();
    this.isGameStarted = false;
    this.polyPieces = [new PolyPiece(this.pieces[0][0], this)];
    for (let ky = 0; ky < this.ny; ky++) {
      for (let kx = 0; kx < this.nx; kx++) {
        if (kx === 0 && ky === 0) continue;
        this.polyPieces[0].pieces.push(this.pieces[ky][kx]);
      }
    }
    this.polyPieces[0].pckxmin = 0;
    this.polyPieces[0].pckxmax = this.nx;
    this.polyPieces[0].pckymin = 0;
    this.polyPieces[0].pckymax = this.ny;
    this.polyPieces[0].listLoops();
    this.polyPieces[0].drawImage();
    this.polyPieces[0].moveToInitialPlace();
    events.push({ event: "gaveUp" });
  }
}

let loadFile = (function () {
  let elFile = document.createElement("input");
  elFile.setAttribute("type", "file");
  elFile.style.display = "none";
  elFile.addEventListener("change", function () {
    if (this.files.length == 0) return;
    let reader = new FileReader();
    reader.addEventListener(
      "load",
      () => (puzzle.srcImage.src = reader.result)
    );
    reader.readAsDataURL(this.files[0]);
  });
  return function () {
    elFile.setAttribute("accept", "image/*");
    elFile.value = null;
    elFile.click();
  };
})();

function loadInitialFile() {
  puzzle.srcImage.src = ".\\wallhaven.jpg";
}

function fitImage(img, width, height) {
  let wn = img.naturalWidth,
    hn = img.naturalHeight;
  let w = width,
    h = (w * hn) / wn;
  if (h > height) {
    h = height;
    w = (h * wn) / hn;
  }
  img.style.position = "absolute";
  img.style.width = w + "px";
  img.style.height = h + "px";
  img.style.top = "50%";
  img.style.left = "50%";
  img.style.transform = "translate(-50%,-50%)";
}

let events = [];
let animate = (function () {
  let state = 0,
    moving,
    tmpImage;
  const startButton = document.getElementById("startButton");
  const loadImageButton = document.getElementById("loadImageButton");

  return function () {
    requestAnimationFrame(animate);
    let event = events.length ? events.shift() : null;

    if (event && event.event == "reset") state = 0;
    if (event && event.event == "srcImageLoaded") state = 0;

    if (event && event.event == "resize") {
      puzzle.prevWidth = puzzle.contWidth;
      puzzle.prevHeight = puzzle.contHeight;
      puzzle.getContainerSize();
      if (state == 10 || state > 60) {
        fitImage(tmpImage, puzzle.contWidth * 0.95, puzzle.contHeight * 0.95);
      } else if (state >= 20) {
        puzzle.prevGameWidth = puzzle.gameWidth;
        puzzle.prevGameHeight = puzzle.gameHeight;
        puzzle.scale();
        let reScale = puzzle.contWidth / puzzle.prevWidth;
        puzzle.polyPieces.forEach((pp) => {
          let nx =
            puzzle.contWidth / 2 - (puzzle.prevWidth / 2 - pp.x) * reScale;
          let ny =
            puzzle.contHeight / 2 - (puzzle.prevHeight / 2 - pp.y) * reScale;
          nx = mmin(
            mmax(nx, -puzzle.scalex / 2),
            puzzle.contWidth - 1.5 * puzzle.scalex
          );
          ny = mmin(
            mmax(ny, -puzzle.scaley / 2),
            puzzle.contHeight - 1.5 * puzzle.scaley
          );
          pp.moveTo(nx, ny);
          pp.drawImage();
        });
      }
      return;
    }

    switch (state) {
      case 0:
        state = 10;
        break;

      case 10:
        if (!puzzle.imageLoaded) return;
        puzzle.container.innerHTML = "";
        tmpImage = document.createElement("img");
        tmpImage.src = puzzle.srcImage.src;
        puzzle.getContainerSize();
        fitImage(tmpImage, puzzle.contWidth * 0.95, puzzle.contHeight * 0.95);
        tmpImage.style.boxShadow = "4px 4px 15px rgba(0, 0, 0, 0.5)";
        puzzle.container.appendChild(tmpImage);
        startButton.textContent = "Start";
        startButton.classList.remove("hidden");
        loadImageButton.classList.remove("hidden");
        state = 15;
        break;

      case 15:
        if (!event) return;
        if (event.event == "start") {
          puzzle.nbPieces = 50;
          puzzle.startTimer();
          puzzle.isGameStarted = true;
          startButton.textContent = "Give Up";
          loadImageButton.classList.add("hidden");
          state = 20;
        } else if (event.event == "loadImage" && !puzzle.isGameStarted) {
          loadFile();
          state = 10;
        }
        break;

      case 20:
        puzzle.create();
        puzzle.scale();
        puzzle.polyPieces.forEach((pp) => {
          pp.drawImage();
          pp.moveToInitialPlace();
        });
        puzzle.gameCanvas.style.top = puzzle.offsy + "px";
        puzzle.gameCanvas.style.left = puzzle.offsx + "px";
        puzzle.gameCanvas.style.display = "block";
        state = 25;
        break;

      case 25:
        puzzle.gameCanvas.style.display = "none";
        puzzle.polyPieces.forEach((pp) => pp.canvas.classList.add("moving"));
        puzzle.optimInitial();
        setTimeout(() => events.push({ event: "finished" }), 800);
        state = 30;
        break;

      case 30:
        if (!event || event.event != "finished") return;
        puzzle.polyPieces.forEach((pp) => pp.canvas.classList.remove("moving"));
        state = 40;
        break;

      case 40:
        if (!event) return;
        if (event.event == "touch") {
          moving = {
            xMouseInit: event.position.x,
            yMouseInit: event.position.y,
          };
          for (let k = puzzle.polyPieces.length - 1; k >= 0; --k) {
            let pp = puzzle.polyPieces[k];
            if (
              pp.ctx.isPointInPath(
                pp.path,
                event.position.x - pp.x,
                event.position.y - pp.y
              )
            ) {
              moving.pp = pp;
              moving.ppXInit = pp.x;
              moving.ppYInit = pp.y;
              puzzle.polyPieces.splice(k, 1);
              puzzle.polyPieces.push(pp);
              pp.canvas.style.zIndex = puzzle.zIndexSup;
              state = 45;
              break;
            }
          }
        } else if (event.event == "start") {
          puzzle.giveUp();
          state = 60;
        }
        break;

      case 45:
        if (!event) return;
        if (event.event == "move") {
          moving.pp.moveTo(
            event.position.x - moving.xMouseInit + moving.ppXInit,
            event.position.y - moving.yMouseInit + moving.ppYInit
          );
        } else if (event.event == "leave") {
          let doneSomething;
          do {
            doneSomething = false;
            for (let k = puzzle.polyPieces.length - 1; k >= 0; --k) {
              let pp = puzzle.polyPieces[k];
              if (pp == moving.pp) continue;
              if (moving.pp.ifNear(pp)) {
                if (pp.pieces.length > moving.pp.pieces.length) {
                  pp.merge(moving.pp);
                  moving.pp = pp;
                } else {
                  moving.pp.merge(pp);
                }
                doneSomething = true;
                break;
              }
            }
          } while (doneSomething);
          puzzle.evaluateZIndex();
          state = puzzle.polyPieces.length == 1 ? 60 : 40;
        }
        break;

      case 60:
        puzzle.stopTimer();
        puzzle.container.innerHTML = "";
        puzzle.getContainerSize();
        fitImage(tmpImage, puzzle.contWidth * 0.95, puzzle.contHeight * 0.95);
        tmpImage.style.boxShadow = "4px 4px 15px rgba(0, 0, 0, 0.5)";
        tmpImage.style.left =
          ((puzzle.polyPieces[0].x + puzzle.scalex / 2 + puzzle.gameWidth / 2) /
            puzzle.contWidth) *
            100 +
          "%";
        tmpImage.style.top =
          ((puzzle.polyPieces[0].y +
            puzzle.scaley / 2 +
            puzzle.gameHeight / 2) /
            puzzle.contHeight) *
            100 +
          "%";
        tmpImage.classList.add("moving");
        setTimeout(() => {
          tmpImage.style.top = tmpImage.style.left = "50%";
          const winMessage = document.createElement("div");
          winMessage.textContent =
            event && event.event === "gaveUp" ? "Game Over" : "You Won!";
          winMessage.style.position = "absolute";
          winMessage.style.top = "10%";
          winMessage.style.left = "90%";
          winMessage.style.transform = "translateX(0)";
          winMessage.style.fontSize = "32px";
          winMessage.style.color = "#00cc00";
          winMessage.style.zIndex = "1002";
          puzzle.container.appendChild(winMessage);
          startButton.textContent = "Start";
          loadImageButton.classList.remove("hidden");
        }, 0);
        puzzle.container.appendChild(tmpImage);
        state = 65;
        break;

      case 65:
        if (event && event.event == "start") {
          puzzle.nbPieces = 50;
          startButton.textContent = "Give Up";
          loadImageButton.classList.add("hidden");
          puzzle.startTimer();
          puzzle.isGameStarted = true;
          state = 20;
        } else if (
          event &&
          event.event == "loadImage" &&
          !puzzle.isGameStarted
        ) {
          loadFile();
          state = 10;
        }
        break;

      default:
        throw "Unknown state: " + state;
    }
  };
})();

document.getElementById("startButton").addEventListener("click", () => {
  if (!puzzle.isGameStarted) {
    events.push({ event: "start" });
  } else {
    events.push({ event: "start" });
  }
});

document.getElementById("loadImageButton").addEventListener("click", () => {
  if (!puzzle.isGameStarted) {
    events.push({ event: "loadImage" });
  }
});

window.addEventListener("resize", () => {
  if (events.length && events[events.length - 1].event == "resize") return;
  events.push({ event: "resize" });
});

puzzle = new Puzzle({ container: "forPuzzle" });
loadInitialFile();
requestAnimationFrame(animate);
