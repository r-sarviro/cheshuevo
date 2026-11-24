
      /*
  Спрайты, нарисованные кодом: огонёк, жемчужина-загрузка, облака, небо первого экрана (hero).
  Каталог драконов — PNG-sheets в shared/ui/sprite/sheet.
  Генератор взят из мудборда без изменений в рисовании.
  Чужих картинок здесь нет, всё свободно для проекта.

  Как пользоваться:
        PixelSprites.mount(canvas, 'pearl')             горящая жемчужина, холст 48x48
    PixelSprites.mount(canvas, 'loader')            загрузка: жемчужина по кругу, холст 48x48
    PixelSprites.mount(canvas, 'clouds')            облака на небе, холст 180x72: день или ночь по теме; 'clouds-day', 'clouds-sunset', 'clouds-night' всегда своё время
    PixelSprites.mount(canvas, 'flame')             огонёк, холст 56x52
    PixelSprites.hero(element)                      небо с драконом, который летит за жемчужиной; внутри три <canvas data-layer="sky|mid|fly">
                                                    небо по теме страницы: закат в дневной теме, ночь в ночной; вручную: data-sky="day", "sunset", "night"
    PixelSprites.refresh()                          перерисовать после смены темы
  Спокойный режим (prefers-reduced-motion): рисуется один неподвижный кадр.
*/
      const pixelSpritesApi = (function () {
        const root = document.documentElement
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
        /* ---------- пиксельные примитивы ---------- */
        function px(c, x, y, col, w = 1, h = 1) {
          c.fillStyle = col
          c.fillRect(Math.round(x), Math.round(y), w, h)
        }
        function disk(c, x, y, r, col, yMax) {
          c.fillStyle = col
          x = Math.round(x)
          y = Math.round(y)
          if (r < 0.75) {
            c.fillRect(x, y, 1, 1)
            return
          }
          const R = Math.floor(r + 0.25),
            rr = r * r + r * 0.55
          for (let dy = -R; dy <= R; dy++) {
            if (yMax !== undefined && y + dy > yMax) break
            const q = rr - dy * dy
            if (q < 0) continue
            const w = Math.floor(Math.sqrt(q))
            c.fillRect(x - w, y + dy, 2 * w + 1, 1)
          }
        }
        function line(c, x0, y0, x1, y1, col) {
          c.fillStyle = col
          x0 = Math.round(x0)
          y0 = Math.round(y0)
          x1 = Math.round(x1)
          y1 = Math.round(y1)
          const dx = Math.abs(x1 - x0),
            sx = x0 < x1 ? 1 : -1,
            dy = -Math.abs(y1 - y0),
            sy = y0 < y1 ? 1 : -1
          let e = dx + dy
          for (let g = 0; g < 400; g++) {
            c.fillRect(x0, y0, 1, 1)
            if (x0 === x1 && y0 === y1) break
            const e2 = 2 * e
            if (e2 >= dy) {
              e += dy
              x0 += sx
            }
            if (e2 <= dx) {
              e += dx
              y0 += sy
            }
          }
        }
        function poly(c, P, col) {
          c.fillStyle = col
          let x0 = 1e9,
            x1 = -1e9,
            y0 = 1e9,
            y1 = -1e9
          for (const p of P) {
            x0 = Math.min(x0, p[0])
            x1 = Math.max(x1, p[0])
            y0 = Math.min(y0, p[1])
            y1 = Math.max(y1, p[1])
          }
          for (let y = Math.floor(y0); y <= Math.ceil(y1); y++)
            for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
              let ins = false
              for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
                const xi = P[i][0],
                  yi = P[i][1],
                  xj = P[j][0],
                  yj = P[j][1]
                if (
                  yi > y !== yj > y &&
                  x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
                )
                  ins = !ins
              }
              if (ins) c.fillRect(x, y, 1, 1)
            }
        }
        const bufs = {}
        function buf(W, H, k) {
          const key = k + W + 'x' + H
          if (!bufs[key]) {
            const cv = document.createElement('canvas')
            cv.width = W
            cv.height = H
            bufs[key] = cv.getContext('2d')
            bufs[key].imageSmoothingEnabled = false
          }
          return bufs[key]
        }
        /* рисуем в буфер, потом обводим силуэт одним пикселем */
        function outlined(dst, out, fn) {
          const W = dst.canvas.width,
            H = dst.canvas.height,
            B = buf(W, H, 'b'),
            A = buf(W, H, 'a')
          B.globalCompositeOperation = 'source-over'
          B.clearRect(0, 0, W, H)
          fn(B)
          B.globalCompositeOperation = 'source-over'
          A.globalCompositeOperation = 'source-over'
          A.clearRect(0, 0, W, H)
          A.drawImage(B.canvas, 0, 0)
          A.globalCompositeOperation = 'source-in'
          A.fillStyle = out
          A.fillRect(0, 0, W, H)
          dst.drawImage(A.canvas, 1, 0)
          dst.drawImage(A.canvas, -1, 0)
          dst.drawImage(A.canvas, 0, 1)
          dst.drawImage(A.canvas, 0, -1)
          dst.drawImage(B.canvas, 0, 0)
        }
        function spline(P) {
          return (s) => {
            const m = P.length - 1,
              f = Math.min(Math.max(s, 0), 0.9999) * m,
              i = Math.floor(f),
              u = f - i
            const a = P[Math.max(i - 1, 0)],
              b = P[i],
              c = P[i + 1],
              d = P[Math.min(i + 2, m)]
            const cr = (k) =>
              0.5 *
              (2 * b[k] +
                (-a[k] + c[k]) * u +
                (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * u * u +
                (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * u * u * u)
            return [cr(0), cr(1)]
          }
        }

        /* ---------- генератор драконов ---------- */
        const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
        function shade(h, k) {
          return (
            '#' +
            hex(h)
              .map((v) =>
                Math.max(
                  0,
                  Math.min(
                    255,
                    Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)),
                  ),
                )
                  .toString(16)
                  .padStart(2, '0'),
              )
              .join('')
          )
        }
        const col = (c) => {
          const o = Object.assign(
            {
              eye: '#3B2F4F',
              out: '#463A5E',
              blush: '#F59BB0',
              horn: '#FFF1C9',
            },
            c,
          )
          o.light = o.light || shade(o.body, 0.3)
          o.dark = o.dark || shade(o.body, -0.2)
          o.bellyD = o.bellyD || shade(o.belly, -0.13)
          o.maneL = o.maneL || shade(o.mane, 0.35)
          o.hornD = o.hornD || shade(o.horn, -0.2)
          o.wing = o.wing || o.mane
          o.wingFar = o.wingFar || shade(o.wing, -0.22)
          o.rgb = {}
          for (const k of ['body', 'light', 'dark', 'belly', 'bellyD', 'out'])
            o.rgb[k] = hex(o[k])
          return o
        }
        const lung = (R) => (s) =>
          s < 0.06 ? R * 0.82 : s < 0.5 ? R : R * (1 - ((s - 0.5) / 0.5) * 0.8)
        const fat = (n, b, tl) => (s) =>
          s < 0.15
            ? n
            : s < 0.45
              ? n + ((b - n) * (s - 0.15)) / 0.3
              : b + ((tl - b) * (s - 0.45)) / 0.55

        /* касательная и направление "спины" в каждой точке хребта */
        function frames(P, face, steady) {
          const n = P.length,
            F = []
          for (let i = 0; i < n; i++) {
            const a = P[Math.max(i - 2, 0)],
              b = P[Math.min(i + 2, n - 1)]
            let dx = a[0] - b[0],
              dy = a[1] - b[1]
            const L = Math.hypot(dx, dy) || 1
            dx /= L
            dy /= L
            let bx = dy,
              by = -dx
            const pv = F[i - 1]
            if (steady && pv) {
              if (bx * pv.bx + by * pv.by < 0) {
                bx = -bx
                by = -by
              }
            } else if (-by - face * bx * 0.35 < 0) {
              bx = -bx
              by = -by
            }
            F.push({ dx, dy, bx, by })
          }
          return F
        }

        /* тело: для каждого пикселя знаем, где он вдоль хребта (u) и поперёк (v), и красим по этим координатам */
        const rast = {}
        function bodyRaster(B, S, chains) {
          const W = B.canvas.width,
            H = B.canvas.height,
            key = W + 'x' + H,
            N = W * H
          let r = rast[key]
          if (!r)
            r = rast[key] = {
              idx: new Int32Array(N),
              u: new Float32Array(N),
              v: new Float32Array(N),
              rr: new Float32Array(N),
              und: new Uint8Array(N),
              rim: new Uint8Array(N),
              img: B.createImageData(W, H),
            }
          r.idx.fill(-1)
          r.und.fill(0)
          r.rim.fill(0)
          let base = 0
          for (const ch of chains) {
            const P = ch.P,
              F = ch.F,
              R = ch.R,
              n = P.length,
              gap = ch.gap || 16,
              bl = ch.blend || 0,
              L = [0]
            for (let i = 1; i < n; i++)
              L[i] =
                L[i - 1] +
                Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])
            for (let i = n - 1; i >= 0; i--) {
              const f = F[i],
                rad = R[i],
                cx = Math.round(P[i][0]),
                cy = Math.round(P[i][1]),
                m = Math.floor(rad + 0.25),
                r2 = rad * rad + rad * 0.55,
                e2 = rad > 1.5 ? (rad - 1) * (rad - 1) + (rad - 1) * 0.55 : -1,
                id = base + i,
                soft = i >= n - bl
              for (let dy = -m; dy <= m; dy++) {
                const y = cy + dy
                if (y < 0 || y >= H) continue
                for (let dx = -m; dx <= m; dx++) {
                  const x = cx + dx
                  if (x < 0 || x >= W) continue
                  const d2 = dx * dx + dy * dy
                  if (d2 > r2) continue
                  const o = y * W + x,
                    prev = r.idx[o]
                  if (prev >= 0 && Math.abs(prev - id) > gap && !soft)
                    r.und[o] = 1
                  r.rim[o] = r.und[o] && d2 > e2 ? 1 : 0
                  r.idx[o] = id
                  r.u[o] = L[i] - (dx * f.dx + dy * f.dy)
                  r.v[o] = (dx * f.bx + dy * f.by) / Math.max(rad, 1)
                  r.rr[o] = rad
                }
              }
            }
            base += 5000
          }
          const d = r.img.data,
            c = S.col.rgb,
            plate = S.plate || 5,
            cut = S.cut ?? -0.3,
            sc = S.scales !== false,
            ring = S.rings
          for (let o = 0; o < N; o++) {
            const k = o * 4
            if (r.idx[o] < 0) {
              d[k + 3] = 0
              continue
            }
            const v = r.v[o],
              u = Math.floor(r.u[o]),
              rad = r.rr[o]
            let q
            if (r.rim[o]) q = c.out
            else if (v < cut && rad >= 1.6)
              q =
                (rad >= 3 && ((u % plate) + plate) % plate === 0) || v < -0.9
                  ? c.bellyD
                  : c.belly
            else {
              q = c.body
              if (rad >= 3.5) {
                if (v < cut + 0.15) q = c.dark
                else if (v > 0.6) q = c.light
                else if (sc) {
                  const g = (v - cut - 0.15) / 0.3,
                    row = Math.floor(g)
                  if (
                    g - row < 0.5 &&
                    (((u + (row & 1) * 2) % 4) + 4) % 4 === 0
                  )
                    q = c.dark
                }
                if (
                  ring &&
                  (!ring.to || u < ring.to) &&
                  ((u % ring.every) + ring.every) % ring.every < ring.w
                )
                  q = c.belly
              } else if (rad >= 2 && v > 0.45) q = c.light
            }
            d[k] = q[0]
            d[k + 1] = q[1]
            d[k + 2] = q[2]
            d[k + 3] = 255
          }
          B.putImageData(r.img, 0, 0)
        }

        function strand(B, x, y, dx, dy, len, t, ph, c, w) {
          const n = Math.max(2, Math.round(len))
          for (let k = 0; k <= n; k++) {
            const q = k / n,
              wob = Math.sin(t * 3 + ph + k * 0.45) * 1.5 * q
            disk(
              B,
              x + dx * k - dy * wob,
              y + dy * k + dx * wob,
              w * (1 - q) + 0.4,
              c,
            )
          }
        }
        function legD(B, x, y, S, C, face, far, ang) {
          const body = far ? C.dark : C.body,
            L = S.legLen,
            th = S.thigh || L * 0.45
          x = Math.round(x)
          y = Math.round(y)
          if (!far) {
            disk(B, x, y, th, C.dark)
            disk(B, x + face * 0.7, y - 0.7, th - 0.8, body)
          } else disk(B, x, y, th, body)
          const kx = x - face,
            ky = y + th * 0.6,
            fx = Math.round(kx + Math.sin(ang) * L),
            fy = Math.round(ky + Math.cos(ang) * L)
          line(B, kx, ky, fx, fy, body)
          line(B, kx + 1, ky, fx + 1, fy, body)
          line(B, kx, ky + 1, fx, fy + 1, body)
          disk(B, fx, fy, 1.7, body)
          const nC = S.claws || 4,
            cl = far ? C.hornD : C.horn,
            cL = S.clawLen || 3.4
          for (let k = 0; k < nC; k++) {
            const a =
              ang + face * 0.45 + (nC > 1 ? -0.95 + (1.9 * k) / (nC - 1) : 0)
            line(
              B,
              fx + Math.sin(a) * 1.6,
              fy + Math.cos(a) * 1.6,
              fx + Math.sin(a) * (1.6 + cL),
              fy + Math.cos(a) * (1.6 + cL),
              cl,
            )
          }
          return [fx, fy]
        }
        function wingD(B, ax, ay, sz, face, t, C, far) {
          const fl = 0.85 + 0.22 * Math.sin(t * 3.2),
            m = far ? C.wingFar : C.wing
          const tip = (a, l) => [
              ax - face * Math.cos(a) * l * sz,
              ay - Math.sin(a) * l * sz * fl,
            ],
            pull = (P, Q, k) => [
              ((P[0] + Q[0]) / 2) * (1 - k) + ax * k,
              ((P[1] + Q[1]) / 2) * (1 - k) + ay * k,
            ]
          const T1 = tip(1.3, 0.95),
            T2 = tip(0.8, 1.3),
            T3 = tip(0.35, 1.25),
            T4 = tip(-0.12, 0.9)
          if (!far)
            for (const T of [T1, T2, T3, T4])
              line(B, ax, ay, T[0], T[1], C.dark)
          poly(
            B,
            [
              [ax, ay],
              T1,
              pull(T1, T2, 0.16),
              T2,
              pull(T2, T3, 0.2),
              T3,
              pull(T3, T4, 0.24),
              T4,
              [ax - face * sz * 0.35, ay + sz * 0.12],
            ],
            m,
          )
        }

        function head(B, S, C, hx, hy, f, t, rh) {
          hx = Math.round(hx)
          hy = Math.round(hy)
          const sn = S.snout ?? 1,
            hn = S.horns,
            X = (d) => hx + f * d,
            Lr = (dx, dy, w, h, c) => {
              dx = Math.round(dx)
              B.fillStyle = c
              B.fillRect(
                f > 0 ? hx + dx : hx - dx - (w - 1),
                hy + Math.round(dy),
                w,
                h,
              )
            },
            Ll = (x0, y0, x1, y1, c) =>
              line(B, X(x0), hy + y0, X(x1), hy + y1, c),
            Pg = (pts, c) =>
              poly(
                B,
                pts.map((p) => [X(p[0]), hy + p[1]]),
                c,
              )
          const antler = (bx, by, c, k) => {
            const a = rh * 1.25 * k
            Ll(bx, by, bx - a * 0.5, by - a * 0.9, c)
            Ll(bx + 1, by, bx - a * 0.5 + 1, by - a * 0.9, c)
            Ll(bx - a * 0.28, by - a * 0.5, bx + a * 0.18, by - a * 0.98, c)
            Ll(bx - a * 0.5, by - a * 0.9, bx - a * 0.95, by - a * 1.08, c)
            Ll(bx - a * 0.42, by - a * 0.72, bx - a * 0.88, by - a * 0.62, c)
          }
          const horn = (bx, by, c, k) =>
            Pg(
              [
                [bx - rh * 0.24, by],
                [bx + rh * 0.24, by],
                [bx - rh * 0.6 * k, by - rh * 0.9 * k],
              ],
              c,
            )
          /* под черепом: дальний рог, гребень, перья, грива, ухо */
          if (hn === 'antler') antler(rh * 0.4, -rh * 0.7, C.hornD, 0.85)
          else if (hn === 'short') horn(rh * 0.35, -rh * 0.75, C.hornD, 0.85)
          else if (hn === 'crest')
            Pg(
              [
                [-rh * 0.9, -rh * 0.2],
                [rh * 0.75, -rh * 0.7],
                [rh * 0.15, -rh * 1.5],
                [-rh * 0.15, -rh * 2.7],
                [-rh * 0.75, -rh * 1.65],
                [-rh * 1.25, -rh * 2.0],
                [-rh * 1.35, -rh * 0.8],
              ],
              C.mane,
            )
          else if (hn === 'flame')
            Pg(
              [
                [-rh * 0.3, -rh * 0.7],
                [rh * 0.55, -rh * 0.8],
                [-rh * 0.1, -rh * 1.45],
                [-rh * 1.0, -rh * 2.0],
                [-rh * 2.5, -rh * 1.8],
                [-rh * 1.4, -rh * 1.25],
                [-rh * 2.0, -rh * 0.9],
                [-rh * 1.0, -rh * 0.45],
              ],
              C.mane,
            )
          if (S.ruff)
            for (let j = 0; j < 8; j++) {
              const a = 1.25 - j * 0.36
              strand(
                B,
                X(-rh * 0.35),
                hy + rh * 0.1,
                -f * Math.cos(a),
                -Math.sin(a),
                rh * (1.75 - Math.abs(j - 3.5) * 0.1),
                t,
                j * 0.9,
                S.ruff[j % S.ruff.length],
                1.5,
              )
            }
          if (S.mane)
            for (let j = 0; j < 5; j++) {
              const a = -0.6 + j * 0.3
              strand(
                B,
                X(-rh * 0.55),
                hy - rh * 0.65 + j * rh * 0.36,
                -f * Math.cos(a),
                Math.sin(a),
                rh * (1.8 - j * 0.12),
                t,
                j * 1.3,
                j % 2 ? C.maneL : C.mane,
                rh * 0.27,
              )
            }
          if (S.ear)
            Pg(
              [
                [-rh * 0.3, -rh * 0.45],
                [-rh * 1.3, -rh * 1.05],
                [-rh * 0.95, -rh * 0.1],
              ],
              C.dark,
            )
          /* череп, морда, шишка носа */
          disk(B, hx, hy, rh, C.body)
          const m1x = X(rh * 0.85 * sn),
            m2x = X(rh * 1.5 * sn),
            nbx = X(rh * 1.85 * sn),
            my = hy + Math.round(rh * 0.55)
          disk(B, m1x, hy + rh * 0.26, rh * 0.7, C.body)
          disk(B, m2x, hy + rh * 0.36, rh * 0.52, C.body)
          disk(B, nbx, hy + rh * 0.1, rh * 0.3, C.body)
          if (S.trunk) {
            Ll(rh * 1.9 * sn, rh * 0.05, rh * 2.35 * sn, -rh * 0.5, C.body)
            Ll(
              rh * 1.9 * sn,
              rh * 0.05 + 1,
              rh * 2.35 * sn,
              -rh * 0.5 + 1,
              C.body,
            )
          }
          B.globalCompositeOperation = 'source-atop'
          disk(B, X(-rh * 0.15), hy - rh * 0.52, rh * 0.5, C.light)
          disk(B, nbx, hy + rh * 0.1 - 1, rh * 0.2, C.light)
          disk(B, m1x, my + rh * 0.78, rh * 0.74, C.belly)
          disk(B, m2x, my + rh * 0.6, rh * 0.56, C.belly)
          disk(B, X(rh * 0.15), hy + rh * 1.25, rh * 0.55, C.belly)
          B.globalCompositeOperation = 'source-over'
          Ll(rh * (1.5 * sn + 0.42), rh * 0.55, rh * 0.5 * sn, rh * 0.55, C.out)
          Ll(rh * 0.5 * sn, rh * 0.55, rh * 0.3 * sn, rh * 0.36, C.out)
          const nz = Math.max(1, Math.round(rh / 7))
          Lr(rh * 1.85 * sn, rh * 0.02, nz, nz, C.out)
          /* глаз, румянец */
          const e = Math.max(2, Math.round(rh * 0.36)),
            ex = Math.round(rh * 0.36),
            ey = -Math.round(rh * 0.42)
          if ((t * 1000) % 3400 < 170) Lr(ex, ey + e / 2, e + 1, 1, C.out)
          else {
            Lr(ex, ey, e + 1, e + 1, '#FFFFFF')
            Lr(ex + 1, ey, e, e + 1, C.eye)
            const hl = e >= 4 ? 2 : 1
            Lr(ex + 1, ey, hl, hl, '#FFFFFF')
          }
          Lr(
            ex - 1,
            ey + e + 2,
            Math.max(2, e),
            Math.max(1, Math.round(rh / 6)),
            C.blush,
          )
          /* ближний рог, корона, внутренний язык гребня */
          if (hn === 'antler') antler(-rh * 0.15, -rh * 0.8, C.horn, 1)
          else if (hn === 'short') horn(-rh * 0.15, -rh * 0.82, C.horn, 1)
          else if (hn === 'crest') {
            Pg(
              [
                [-rh * 0.55, -rh * 0.6],
                [rh * 0.35, -rh * 0.85],
                [-rh * 0.1, -rh * 2.0],
                [-rh * 0.65, -rh * 1.2],
              ],
              C.horn,
            )
            Pg(
              [
                [-rh * 0.3, -rh * 0.8],
                [rh * 0.1, -rh * 0.9],
                [-rh * 0.12, -rh * 1.5],
              ],
              C.mane,
            )
          } else if (hn === 'crown') {
            const w = Math.round(rh * 1.5),
              x0 = -rh * 0.8,
              ph = Math.round(rh * 0.55)
            Lr(x0, -rh - 2, w, 3, C.horn)
            for (const q of [0, 0.5, 1])
              Lr(
                x0 + q * (w - 2),
                -rh - 2 - ph - (q === 0.5 ? 2 : 0),
                2,
                ph + (q === 0.5 ? 2 : 0),
                C.horn,
              )
            Lr(x0 + w / 2 - 1, -rh - 1, 2, 2, '#E5556A')
            Lr(x0, -rh + 1, w, 1, C.hornD)
          } else if (hn === 'plumes')
            for (let j = 0; j < 3; j++)
              strand(
                B,
                X(-rh * 0.2 - j * rh * 0.25),
                hy - rh * 0.8,
                -f * (0.35 + j * 0.25),
                -0.9 + j * 0.2,
                rh * 1.5,
                t,
                j,
                S.ruff ? S.ruff[(j + 1) % S.ruff.length] : C.mane,
                1.6,
              )
          if (S.beard)
            for (let j = 0; j < 3; j++)
              strand(
                B,
                X(rh * (0.15 + j * 0.32)),
                hy + rh * 1.05,
                -f * 0.4,
                0.92,
                rh * (0.95 - j * 0.15),
                t,
                j,
                j % 2 ? C.maneL : C.mane,
                1.5,
              )
          if (S.whisk)
            for (const j of [0, 1]) {
              const len = S.whisk * (j ? 0.8 : 1),
                sx = rh * (1.5 * sn + 0.3),
                sy = rh * 0.32
              let x0 = sx,
                y0 = sy
              for (let q = 1; q <= 12; q++) {
                const a = q / 12,
                  x1 = sx + Math.sin(a * 2.4) * len * 0.3 - a * len * 0.75,
                  y1 =
                    sy +
                    a * len * (j ? 0.7 : 0.3) -
                    (j ? 0 : Math.sin(a * 3.1) * len * 0.28) +
                    Math.sin(t * 3 + a * 5 + j * 2) * 1.6 * a
                Ll(x0, y0, x1, y1, C.whisk || C.maneL)
                x0 = x1
                y0 = y1
              }
            }
        }
        function drawDragon(dst, S, P, t, o = {}) {
          const C = S.col,
            n = P.length,
            face = o.face ?? S.face ?? 1,
            F = frames(P, face, !S.twist),
            R = P.map((_, i) => S.rad(i / (n - 1)))
          const maxR = Math.max(...R),
            at = (s) => Math.round(s * (n - 1)),
            wi = S.wing ? at(S.wing.at) : 0,
            feet = [],
            farFeet = [],
            ang = (j) => (S.legAng ? S.legAng[j] : 0.3) * face
          const necks = (o.necks || []).map((k) => {
            const f = k.face ?? face,
              m = k.pts.length
            return {
              P: k.pts,
              face: f,
              F: frames(k.pts, f, true),
              R: k.pts.map((_, i) => S.neckR * (1 + (0.3 * i) / m)),
              blend: Math.round(m * 0.3),
            }
          })
          outlined(dst, C.out, (B) => {
            bodyRaster(B, S, [
              { P, F, R, gap: Math.max(16, maxR * 3.5) },
              ...necks,
            ])
            B.globalCompositeOperation = 'destination-over'
            if (S.spikes) {
              const sp = S.spikes,
                i1 = at(sp.to ?? 0.93)
              let acc = sp.gap,
                q = 0
              for (let i = at(sp.from ?? 0.05); i <= i1; i++) {
                if (i > 0)
                  acc += Math.hypot(
                    P[i][0] - P[i - 1][0],
                    P[i][1] - P[i - 1][1],
                  )
                if (acc < sp.gap) continue
                acc = 0
                const p = P[i],
                  f = F[i],
                  r = R[i]
                if (r < 1.2) continue
                const c1 = sp.colors
                    ? sp.colors[q++ % sp.colors.length]
                    : C.mane,
                  ln = sp.len * Math.min(1, 0.35 + (r / maxR) * 0.75),
                  w = sp.w
                const bx = p[0] + f.bx * (r - 1),
                  by = p[1] + f.by * (r - 1),
                  tx = bx + f.bx * ln - f.dx * ln * 0.7,
                  ty = by + f.by * ln - f.dy * ln * 0.7
                line(
                  B,
                  bx + f.dx * w,
                  by + f.dy * w,
                  tx,
                  ty,
                  sp.colors ? c1 : C.maneL,
                )
                poly(
                  B,
                  [
                    [bx + f.dx * w, by + f.dy * w],
                    [bx - f.dx * w, by - f.dy * w],
                    [tx, ty],
                  ],
                  c1,
                )
              }
            }
            const tp = P[n - 1],
              tf = F[n - 1],
              tl = S.tailLen
            if (S.tail === 'tuft' || S.tail === 'fan') {
              const fan = S.tail === 'fan'
              ;(fan
                ? [-1, -0.5, 0, 0.5, 1]
                : [-0.7, -0.35, 0, 0.35, 0.7]
              ).forEach((a, j) => {
                const ca = Math.cos(a),
                  sa = Math.sin(a),
                  vx = -(tf.dx * ca - tf.dy * sa),
                  vy = -(tf.dx * sa + tf.dy * ca)
                strand(
                  B,
                  tp[0],
                  tp[1],
                  vx,
                  vy,
                  tl * (1 - Math.abs(a) * 0.25),
                  t,
                  j * 1.7,
                  fan && S.spikes && S.spikes.colors
                    ? S.spikes.colors[j % S.spikes.colors.length]
                    : j % 2
                      ? C.maneL
                      : C.mane,
                  fan ? 1.3 : 1.7,
                )
              })
            } else if (S.tail === 'arrow')
              poly(
                B,
                [
                  [tp[0] - tf.dx * tl, tp[1] - tf.dy * tl],
                  [tp[0] + tf.bx * tl * 0.6, tp[1] + tf.by * tl * 0.6],
                  [tp[0] + tf.dx * 2, tp[1] + tf.dy * 2],
                  [tp[0] - tf.bx * tl * 0.6, tp[1] - tf.by * tl * 0.6],
                ],
                C.mane,
              )
            ;(S.legs || []).forEach((s, j) => {
              const i = at(s)
              farFeet.push(
                legD(
                  B,
                  P[i][0] + face * 3,
                  P[i][1] + R[i] * 0.35,
                  S,
                  C,
                  face,
                  true,
                  ang(j) + 0.3 * face,
                ),
              )
            })
            if (S.wing)
              wingD(
                B,
                P[wi][0] + F[wi].bx * R[wi] * 0.5 + face * 4,
                P[wi][1] + F[wi].by * R[wi] * 0.5 - 2,
                S.wing.size,
                face,
                t + 0.4,
                C,
                true,
              )
            B.globalCompositeOperation = 'source-over'
            ;(S.legs || []).forEach((s, j) => {
              const i = at(s)
              feet.push(
                legD(
                  B,
                  P[i][0],
                  P[i][1] + R[i] * 0.55,
                  S,
                  C,
                  face,
                  false,
                  ang(j),
                ),
              )
            })
            necks.forEach((k, j) =>
              head(
                B,
                S,
                C,
                k.P[0][0],
                k.P[0][1],
                k.face,
                t + j * 1.3 + 0.7,
                S.headR * 0.9,
              ),
            )
            if (S.wing)
              wingD(
                B,
                P[wi][0] + F[wi].bx * R[wi] * 0.5,
                P[wi][1] + F[wi].by * R[wi] * 0.5,
                S.wing.size,
                face,
                t,
                C,
                false,
              )
            head(B, S, C, P[0][0], P[0][1], face, t, S.headR)
          })
          return { feet, farFeet }
        }

        /* ---------- мелкие спрайты и фон ---------- */
        function pearl(
          c,
          x,
          y,
          t,
          core = '#FFE08A',
          glow = 'rgba(255,223,135,.38)',
          s = 1,
        ) {
          x = Math.round(x)
          y = Math.round(y)
          const fl = Math.floor(t * 8) % 2
          disk(c, x, y, 5 * s, glow)
          disk(c, x, y, 3.4 * s, '#463A5E')
          disk(c, x, y, 2.4 * s, core)
          disk(c, x - 0.8 * s, y - 0.8 * s, 0.9 * s, '#FFFFFF')
          if (s >= 1.5) {
            poly(
              c,
              [
                [x - 2 * s, y - 2.6 * s],
                [x + 2 * s, y - 2.6 * s],
                [x + (fl ? 1 : -1) * s, y - 5.8 * s],
              ],
              '#F0764A',
            )
            poly(
              c,
              [
                [x - s, y - 2.8 * s],
                [x + 1.2 * s, y - 2.8 * s],
                [x + (fl ? 0.4 : -0.4) * s, y - 4.4 * s],
              ],
              '#FFC94D',
            )
            poly(
              c,
              [
                [x + 2 * s, y - 1.5 * s],
                [x + 3.2 * s, y + 0.5 * s],
                [x + (fl ? 5 : 4.4) * s, y - 2.8 * s],
              ],
              '#F0764A',
            )
          } else {
            px(c, x + (fl ? 1 : 0), y - 6, '#F0764A', 1, 2)
            px(c, x - 2 + (fl ? 0 : 1), y - 5, '#F9A03F')
          }
        }
        function cloud(c, x, y, k, colr, shadeC) {
          x = Math.round(x)
          y = Math.round(y)
          const parts = [
              [-7, 0, 3.2],
              [-2, -2, 4.6],
              [4, -1, 3.8],
              [9, 1, 2.6],
            ],
            base = y + Math.round(2 * k)
          for (const [dx, dy, r] of parts)
            disk(c, x + dx * k, y + dy * k, r * k, shadeC, base)
          for (const [dx, dy, r] of parts)
            disk(c, x + dx * k, y + dy * k - 1, r * k, colr, base - 1)
        }
        function swirl(c, x, y, colr, hole) {
          disk(c, x, y, 5, colr)
          disk(c, x + 8, y + 1, 4, colr)
          disk(c, x - 7, y + 2, 3.2, colr)
          px(c, x - 11, y + 4, colr, 26, 2)
          disk(c, x + 1, y, 2, hole)
          px(c, x + 1, y, colr, 3, 1)
        }
        function waves(c, t, W, H, y0, foam, fill, ph = 0, sp = 2, amp = 2) {
          for (let x = 0; x < W; x++) {
            const sn = Math.sin(x * 0.19 + t * sp + ph),
              y = y0 + Math.round(sn * amp),
              th = sn < -0.6 ? 2 : 1
            px(c, x, y, foam, 1, th)
            if (sn < -0.85 && x % 3 === 0) px(c, x, y - 2, foam)
            px(c, x, y + th, fill, 1, H - y)
          }
        }
        function puff(c, x, y, t, f) {
          const k = Math.floor(t * 8) % 3
          disk(c, x + f * 2, y, 2.4, '#F0764A')
          disk(c, x + f * (6 + k), y - 1, 2, '#F9A03F')
          disk(c, x + f * (10 + k), y - 2 + k, 1.3, '#FFE08A')
        }

        /* дракон бренда: белый речной дракон с бирюзовой гривой. Свой персонаж, не копия чужого. Прежняя нефритовая раскраска: body '#5DBEA8', belly '#FFE6C2', dark '#3C9A89', mane '#F28A5B', horn '#FFE9A6', wing '#F7A77F', wingFar '#D9825F' */
        const BRAND = col({
          body: '#FFFDF6',
          light: '#FFFFFF',
          dark: '#D5D2DE',
          belly: '#F4EBDD',
          mane: '#3FA58F',
          maneL: '#7CCDBB',
          horn: '#F3D98B',
          wing: '#7CCDBB',
          wingFar: '#4FA896',
          whisk: '#7CCDBB',
        })
        const JEWELS = ['#E5556A', '#4FB7D9', '#7CC6A4', '#B9A7E8'],
          FEATHERS = ['#E8604C', '#FFD35A', '#4FB7D9', '#3FB58E']
        /* координаты поз заданы в сетке 80×60 и умножаются на масштаб */
        const SPEC = {
          hero: {
            twist: true,
            rad: lung(3.6),
            headR: 5,
            horns: 'antler',
            mane: true,
            ear: true,
            whisk: 11,
            legs: [0.2, 0.58],
            claws: 5,
            spikes: { gap: 2.5, len: 2.2 },
            tail: 'tuft',
            tailLen: 5,
            col: BRAND,
          }
        }
        function scaled(S, k) {
          const o = Object.assign({}, S)
          o.k = k
          o.rad = (s) => S.rad(s) * k
          o.headR = S.headR * k
          o.neckR = (S.neckR || 2.5) * k
          o.legLen = (S.legLen || 3) * k
          o.clawLen = 1.7 * k
          o.n = Math.round((S.n || 50) * k * 1.25)
          o.tailLen = (S.tailLen || 4) * k
          o.plate = Math.round(2.5 * k)
          if (S.spikes)
            o.spikes = Object.assign({}, S.spikes, {
              len: S.spikes.len * k,
              gap: S.spikes.gap * k,
              w: 0.8 * k,
            })
          if (S.wing) o.wing = { at: S.wing.at, size: S.wing.size * k }
          if (S.whisk) o.whisk = S.whisk * k
          if (S.rings)
            o.rings = {
              every: Math.round(S.rings.every * k),
              w: Math.round(S.rings.w * k),
              to: S.rings.to ? S.rings.to * k : 0,
            }
          return o
        }
        const HERO = scaled(SPEC.hero, 1.7)
        const EXTRA = {
          flame: (c, t) => {
            const W = c.canvas.width,
              H = c.canvas.height
            c.clearRect(0, 0, W, H)
            const w = Math.sin(t * 9) * 1.4,
              w2 = Math.sin(t * 13 + 1) * 1.1,
              cx = 20,
              by = 32
            px(c, 9, by + 1, '#8A5A44', 22, 3)
            px(c, 7, by + 2, '#6E4636', 26, 2)
            outlined(c, '#463A5E', (B) => {
              disk(B, cx, by - 6, 7, '#E8604C')
              disk(B, cx + w * 0.6, by - 12, 4.6, '#E8604C')
              disk(B, cx + w, by - 17, 2.6, '#E8604C')
              px(B, cx + w * 1.4, by - 22, '#E8604C', 1, 2)
              disk(B, cx, by - 5, 5, '#F9A03F')
              disk(B, cx + w2 * 0.6, by - 10, 3, '#F9A03F')
              disk(B, cx, by - 3, 3, '#FFE08A')
              px(B, cx - 3, by - 7, '#3B2F4F', 1, 2)
              px(B, cx + 2, by - 7, '#3B2F4F', 1, 2)
              px(B, cx - 5, by - 4, '#F59BB0', 2, 1)
              px(B, cx + 3, by - 4, '#F59BB0', 2, 1)
            })
          },
          loader: (c, t) => {
            const W = c.canvas.width,
              H = c.canvas.height
            c.clearRect(0, 0, W, H)
            for (let k = 1; k <= 5; k++) {
              const a = t * 5 - k * 0.42
              px(
                c,
                20 + Math.cos(a) * 11,
                20 + Math.sin(a) * 11,
                k < 3 ? '#FFF6DD' : 'rgba(255,246,221,.55)',
                k < 2 ? 2 : 1,
                k < 2 ? 2 : 1,
              )
            }
            pearl(c, 20 + Math.cos(t * 5) * 11, 20 + Math.sin(t * 5) * 11, t)
          },
          clouds: (c, t) => {
            const W = c.canvas.width,
              H = c.canvas.height
            c.clearRect(0, 0, W, H)
            cloud(c, ((t * 3) % (W + 40)) - 20, 14, 1.2, '#FFFFFF', '#D7ECF7')
            cloud(
              c,
              ((t * 2 + 50) % (W + 40)) - 20,
              29,
              0.8,
              '#FFFFFF',
              '#D7ECF7',
            )
            px(c, 60, 8, '#FFFFFF', 1, 3)
            px(c, 59, 9, '#FFFFFF', 3, 1)
          },
        }

        /* ---------- жемчужина: горящая, 24 кадра ---------- */
        const TAU = Math.PI * 2,
          P_OUT = '#463A5E'
        const inDisk = (dx, dy, r) => dx * dx + dy * dy <= r * r + r * 0.55
        function flameTongue(c, bx, by, len, w, f, ph, colr) {
          for (let k = 0; k <= len; k++) {
            const q = k / len,
              sway =
                Math.sin(((TAU * f) / 24) * 2 + ph + k * 0.7) * 1.6 * q +
                Math.sin((TAU * f) / 24 + ph) * 0.8 * q
            disk(c, bx + sway, by - k, Math.max(0.4, w * (1 - q * 0.85)), colr)
          }
        }
        function spark(c, x, y, s, colr) {
          if (s <= 0) return
          px(c, x, y, colr)
          if (s >= 2) {
            px(c, x - 1, y, colr, 3, 1)
            px(c, x, y - 1, colr, 1, 3)
          }
          if (s >= 3) {
            px(c, x - 2, y, colr, 5, 1)
            px(c, x, y - 2, colr, 1, 5)
          }
        }
        const twinkle = (k) =>
          k < 2 ? 1 : k < 4 ? 2 : k < 6 ? 3 : k < 8 ? 2 : k < 10 ? 1 : 0
        /* тело жемчужины: тень серпом справа снизу, светлая зона слева сверху, блик пробегает по диагонали */
        function pearlBody(c, cx, cy, R, f) {
          cx = Math.round(cx)
          cy = Math.round(cy)
          disk(c, cx, cy, R + 1, P_OUT)
          for (let dy = -R; dy <= R; dy++)
            for (let dx = -R; dx <= R; dx++) {
              if (!inDisk(dx, dy, R)) continue
              let q = '#FFD76A'
              if (!inDisk(dx + R * 0.3, dy + R * 0.3, R * 0.82)) q = '#F0B048'
              if (
                !inDisk(dx + R * 0.16, dy + R * 0.16, R * 0.95) &&
                dx + dy > R * 0.7
              )
                q = '#D98F3A'
              if (inDisk(dx + R * 0.28, dy + R * 0.3, R * 0.55)) q = '#FFEFA8'
              if (
                dx - dy < -R * 0.9 &&
                dx + dy > R * 0.2 &&
                inDisk(dx, dy, R - 1)
              )
                q = '#FFE9A6'
              const band = dx + dy - ((f * (R * 4 + 8)) / 24 - (R * 2 + 4))
              if (band >= 0 && band < 2 && f < 14) q = '#FFFBE6'
              px(c, cx + dx, cy + dy, q)
            }
          disk(c, cx - R * 0.42, cy - R * 0.45, R * 0.22, '#FFFFFF')
          px(c, cx - Math.round(R * 0.1), cy - Math.round(R * 0.72), '#FFFFFF')
        }
        /* жемчужина с пламенем и свечением. R=7 для спрайта, R=5 для неба первого экрана */
        function pearlFlaming(c, cx, cy, R, f) {
          cx = Math.round(cx)
          cy = Math.round(cy)
          const k = R / 7,
            pulse = [0, 0, 1, 1, 2, 2, 2, 1, 1, 0, 0, 0][
              Math.floor(f / 2) % 12
            ],
            G = Math.ceil(13 * k) + 2
          for (let dy = -G; dy <= G; dy++)
            for (let dx = -G; dx <= G; dx++) {
              const far = inDisk(dx, dy, 13 * k + pulse),
                near = inDisk(dx, dy, 10 * k + pulse)
              if (near) px(c, cx + dx, cy + dy, 'rgba(255,223,135,.5)')
              else if (far && ((dx + dy + (f >> 1)) & 1) === 0)
                px(c, cx + dx, cy + dy, 'rgba(255,223,135,.5)')
            }
          const T = (ox, oy, len, w, ph, colr) =>
            flameTongue(
              c,
              cx + ox * k,
              cy + oy * k,
              Math.round(len * k),
              w * k,
              f,
              ph,
              colr,
            )
          T(-4, -5, 9, 2.6, 0.0, '#F0764A')
          T(1, -6, 13, 3.0, 2.1, '#F0764A')
          T(5, -4, 8, 2.3, 4.0, '#F0764A')
          T(-4, -5, 6, 1.6, 0.4, '#F9A03F')
          T(1, -6, 9, 2.0, 2.5, '#F9A03F')
          T(5, -4, 5, 1.4, 4.4, '#F9A03F')
          T(1, -6, 5, 1.1, 2.9, '#FFE08A')
          pearlBody(c, cx, cy, R, f)
          ;[
            [-2, 0],
            [4, 9],
            [1, 17],
          ].forEach(([ox, ph]) => {
            const q = (f + ph) % 24
            if (q < 12)
              px(
                c,
                cx + ox * k + Math.round(Math.sin(q * 0.8 + ph) * 2),
                cy - Math.round(16 * k) - q,
                q < 8 ? '#F9A03F' : '#F0764A',
              )
          })
        }
        EXTRA.pearl = (c, t) => {
          const W = c.canvas.width,
            H = c.canvas.height,
            f = Math.round(t * 12) % 24
          c.clearRect(0, 0, W, H)
          const cx = W >> 1,
            cy = (H >> 1) + 4
          pearlFlaming(c, cx, cy, 7, f)
          ;[
            [-16, -14, 0],
            [16, -8, 8],
            [-14, 10, 16],
            [15, 11, 4],
            [6, -21, 12],
          ].forEach(([ox, oy, ph]) =>
            spark(c, cx + ox, cy + oy, twinkle((f + ph) % 24), '#FFF6DD'),
          )
        }
        /* загрузка: жемчужина летит по кругу, 24 положения, хвост из восьми следов */
        EXTRA.loader = (c, t) => {
          const W = c.canvas.width,
            H = c.canvas.height,
            f = Math.round(t * 16) % 24,
            cx = W >> 1,
            cy = H >> 1,
            R = Math.min(W, H) * 0.31,
            N = 24
          c.clearRect(0, 0, W, H)
          for (let i = 0; i < N; i++) {
            const a = (TAU * i) / N
            px(
              c,
              cx + Math.cos(a) * R,
              cy + Math.sin(a) * R,
              'rgba(70,58,94,.22)',
            )
          }
          for (let k = 8; k >= 1; k--) {
            const a = (TAU * (f - k)) / N
            disk(
              c,
              cx + Math.cos(a) * R,
              cy + Math.sin(a) * R,
              3.2 * (1 - k / 9),
              k < 3 ? '#FFE08A' : k < 6 ? '#F9A03F' : '#F0764A',
            )
          }
          const a = (TAU * f) / N,
            x = Math.round(cx + Math.cos(a) * R),
            y = Math.round(cy + Math.sin(a) * R)
          disk(c, x, y, 6.5, 'rgba(255,223,135,.45)')
          pearlBody(c, x, y, 4, (f * 2) % 24)
          spark(c, cx, cy, twinkle(f % 12), '#FFF6DD')
        }

        /* ---------- огонёк: приземистый, с короной языков, 24 кадра. Свой рисунок, холст 56x52 ---------- */
        function blob(parts, maxY) {
          const m = new Set()
          for (const [bx, by, r] of parts) {
            const cx = Math.round(bx),
              cy = Math.round(by),
              R = Math.ceil(r) + 1
            for (let dy = -R; dy <= R; dy++)
              for (let dx = -R; dx <= R; dx++)
                if (inDisk(dx, dy, r) && cy + dy <= maxY)
                  m.add(cx + dx + ',' + (cy + dy))
          }
          return m
        }
        const paint = (c, m, col) => {
          for (const k of m) {
            const [x, y] = k.split(',').map(Number)
            px(c, x, y, col)
          }
        }
        /* язык пламени: цепочка уменьшающихся кругов, наклон наружу, кончик качается */
        function tongue(parts, x, y, ang, len, w, sway) {
          for (let k = 0; k <= len; k++) {
            const q = k / len
            parts.push([
              x + Math.sin(ang) * k + sway * q * q * 2.2,
              y - Math.cos(ang) * k,
              Math.max(0.5, w * (1 - q * 0.9)),
            ])
          }
        }
        function drawFlame(c, f) {
          const W = 56,
            H = 52
          c.clearRect(0, 0, W, H)
          const cx = 28,
            by = 42,
            a = (TAU * f) / 24,
            s = (n, ph) => Math.sin(a * n + ph)
          /* свечение */
          for (let dy = -22; dy <= 22; dy++)
            for (let dx = -24; dx <= 24; dx++)
              if (
                (dx * dx) / 576 + (dy * dy) / 420 <= 1 &&
                ((dx + dy + (f >> 2)) & 1) === 0
              )
                px(c, cx + dx, by - 13 + dy, 'rgba(249,160,63,.2)')
          /* поленья: два, крест-накрест */
          px(c, 4, by, P_OUT, 48, 8)
          px(c, 5, by + 1, '#9A6B4C', 46, 6)
          px(c, 5, by + 1, '#B98562', 46, 1)
          px(c, 5, by + 6, '#6E4636', 46, 1)
          ;[
            [9, 3, 6],
            [20, 4, 7],
            [33, 3, 5],
            [41, 5, 6],
            [14, 5, 4],
          ].forEach(([x, dy, w]) => px(c, x, by + dy, '#6E4636', w, 1))
          px(c, 4, by + 1, '#D2A27E', 2, 6)
          px(c, 50, by + 1, '#D2A27E', 2, 6)
          /* внешний слой: приземистый купол и корона языков */
          const outerP = [
            [cx - 9, by - 9, 10],
            [cx + 9, by - 9, 10],
            [cx, by - 12, 12],
            [cx - 15, by - 6, 6],
            [cx + 15, by - 6, 6],
          ]
          tongue(outerP, cx, by - 21, 0.0, 13 + s(1, 0) * 2, 4.2, s(2, 0.3))
          tongue(
            outerP,
            cx - 8,
            by - 19,
            -0.35,
            9 + s(1, 1.7) * 2,
            3.6,
            s(2, 1.9),
          )
          tongue(
            outerP,
            cx + 8,
            by - 19,
            0.35,
            10 + s(1, 3.1) * 2,
            3.6,
            s(2, 3.4),
          )
          tongue(
            outerP,
            cx - 15,
            by - 14,
            -0.75,
            7 + s(1, 4.2) * 1.5,
            3,
            s(3, 0.8),
          )
          tongue(
            outerP,
            cx + 15,
            by - 14,
            0.75,
            7 + s(1, 5.3) * 1.5,
            3,
            s(3, 2.6),
          )
          tongue(outerP, cx - 20, by - 7, -1.15, 5 + s(1, 2.4), 2.4, s(3, 4.4))
          tongue(outerP, cx + 20, by - 7, 1.15, 5 + s(1, 0.9), 2.4, s(3, 5.6))
          const outer = blob(outerP, by)
          const midP = [
            [cx - 7, by - 8, 8.4],
            [cx + 7, by - 8, 8.4],
            [cx, by - 10, 10],
          ]
          tongue(midP, cx, by - 18, 0.0, 7 + s(1, 0.4) * 1.5, 3, s(2, 0.7))
          tongue(midP, cx - 7, by - 15, -0.3, 5 + s(1, 2.1), 2.4, s(2, 2.3))
          tongue(midP, cx + 7, by - 15, 0.3, 5 + s(1, 3.5), 2.4, s(2, 3.8))
          const mid = blob(midP, by)
          const coreP = [
            [cx - 5, by - 7, 6.6],
            [cx + 5, by - 7, 6.6],
            [cx, by - 8, 7.6],
          ]
          tongue(coreP, cx, by - 14, 0.0, 4 + s(1, 0.8), 2, s(2, 1.1))
          const core = blob(coreP, by)
          for (const k of outer) {
            const [x, y] = k.split(',').map(Number)
            for (const [ax, ay] of [
              [1, 0],
              [-1, 0],
              [0, 1],
              [0, -1],
            ])
              if (!outer.has(x + ax + ',' + (y + ay)))
                px(c, x + ax, y + ay, P_OUT)
          }
          paint(c, outer, '#C4423A')
          paint(c, mid, '#F58A2E')
          paint(c, core, '#FFD25A')
          /* лицо: большие круглые глаза, зрачки переглядываются, румянец, открытый рот */
          const ey = by - 12,
            blink = f === 21 || f === 22,
            look = f < 8 ? 0 : f < 14 ? 1 : f < 20 ? -1 : 0
          for (const ex of [cx - 6, cx + 6]) {
            if (blink) {
              px(c, ex - 2, ey, P_OUT, 5, 1)
              continue
            }
            for (let dy = -3; dy <= 3; dy++)
              for (let dx = -3; dx <= 3; dx++)
                if (inDisk(dx, dy, 2.9)) px(c, ex + dx, ey + dy, P_OUT)
            for (let dy = -2; dy <= 2; dy++)
              for (let dx = -2; dx <= 2; dx++)
                if (inDisk(dx, dy, 1.9)) px(c, ex + dx, ey + dy, '#FFFFFF')
            px(c, ex + look, ey, '#3B2F4F', 2, 2)
            px(c, ex + look, ey, '#FFFFFF', 1, 1)
            px(c, ex + look + 1, ey + 1, '#3B2F4F', 1, 1)
            px(c, ex + look, ey, '#3B2F4F', 1, 1)
            px(c, ex + look + 1, ey, '#3B2F4F', 1, 1)
            px(c, ex + look, ey + 1, '#3B2F4F', 1, 1)
          }
          px(c, cx - 11, ey + 4, '#F59BB0', 3, 1)
          px(c, cx + 9, ey + 4, '#F59BB0', 3, 1)
          const open = f % 12 < 8 /* рот приоткрывается */
          if (open) {
            px(c, cx - 4, ey + 5, P_OUT, 9, 1)
            px(c, cx - 4, ey + 6, P_OUT, 9, 1)
            px(c, cx - 3, ey + 7, P_OUT, 7, 1)
            px(c, cx - 2, ey + 8, P_OUT, 5, 1)
            px(c, cx - 3, ey + 6, '#B8322A', 7, 1)
            px(c, cx - 2, ey + 7, '#E8604C', 5, 1)
          } else {
            px(c, cx - 4, ey + 5, P_OUT, 1, 1)
            px(c, cx - 3, ey + 6, P_OUT, 7, 1)
            px(c, cx + 4, ey + 5, P_OUT, 1, 1)
          }
          /* искры */
          ;[
            [-12, 0],
            [10, 8],
            [2, 16],
          ].forEach(([ox, ph]) => {
            const k = (f + ph) % 24
            if (k < 14)
              px(
                c,
                cx + ox + Math.round(Math.sin(k * 0.7 + ph) * 2),
                by - 36 - k * 0.8,
                k < 5 ? '#FFE08A' : k < 10 ? '#F9A03F' : '#F0764A',
              )
          })
        }
        EXTRA.flame = (c, t) => drawFlame(c, Math.round(t * 12) % 24)

        /* ---------- облака в духе JoJo: кучевые башни, три плоских тона, контур, штриховка, завитки ---------- */
        const CLOUD_PAL = {
          day: {
            sky: ['#7FC4E8', '#96D0EC', '#B5E0F0', '#D9EEE8', '#FFEBD0'],
            light: '#FFFFFF',
            mid: '#FFE0D0',
            shade: '#C9B8EC',
            hatch: '#A996DE',
            out: '#4B3F66',
            curl: '#B9A7E8',
            star: null,
          },
          night: {
            sky: ['#17142F', '#1F1B42', '#2C2558', '#44356F', '#6B4680'],
            light: '#C9BCF2',
            mid: '#8B7BD8',
            shade: '#55489E',
            hatch: '#3D337A',
            out: '#14112A',
            curl: '#6A5CC0',
            star: '#F4EEFF',
          },
          sunset: {
            sky: ['#FFD86A', '#FFE083', '#FFE9A6', '#FFD3B8', '#F9A9A0'],
            light: '#FFF8EC',
            mid: '#F8B4C2',
            shade: '#9C86DC',
            hatch: '#7C68C4',
            out: '#4B3F66',
            curl: '#B9A7E8',
            star: null,
          },
        }
        /* бугры идут от дальних к ближним, у каждого своя светотень: внутри облака видны слои */
        const CLOUD_SHAPES = [
          {
            bumps: [
              [-22, -6, 9],
              [-10, -16, 11],
              [6, -26, 13],
              [20, -14, 10],
              [30, -5, 8],
              [-14, -4, 9],
              [0, -10, 11],
              [14, -5, 9],
              [-2, -2, 8],
            ],
            curls: [
              [6, -27, 6],
              [-10, -16, 5],
            ],
          },
          {
            bumps: [
              [-18, -5, 8],
              [-6, -13, 10],
              [8, -18, 11],
              [20, -8, 8],
              [-8, -4, 8],
              [6, -6, 9],
            ],
            curls: [[8, -19, 5]],
          },
          {
            bumps: [
              [-14, -6, 9],
              [0, -15, 12],
              [14, -7, 9],
              [-4, -4, 8],
              [8, -3, 7],
            ],
            curls: [[0, -16, 5]],
          },
          /* мелкие, для дальнего плана первого экрана */
          {
            bumps: [
              [-9, -4, 6],
              [1, -9, 8],
              [11, -4, 6],
              [2, -3, 6],
            ],
            curls: [[1, -10, 3]],
          },
          {
            bumps: [
              [-5, -3, 5],
              [4, -6, 6],
              [11, -3, 4],
            ],
            curls: [],
          },
        ]
        const cloudCache = {}
        function cloudSprite(i, palKey) {
          const key = i + palKey
          if (cloudCache[key]) return cloudCache[key]
          const sh = CLOUD_SHAPES[i % CLOUD_SHAPES.length],
            pal = CLOUD_PAL[palKey]
          let x0 = 1e9,
            x1 = -1e9,
            y0 = 1e9
          for (const [bx, by, r] of sh.bumps) {
            x0 = Math.min(x0, bx - r)
            x1 = Math.max(x1, bx + r)
            y0 = Math.min(y0, by - r)
          }
          const ox = -x0 + 3,
            oy = -y0 + 3,
            cv = document.createElement('canvas')
          cv.width = x1 - x0 + 6
          cv.height = oy + 2
          const c = cv.getContext('2d'),
            m = new Map()
          for (const [bx, by, r] of sh.bumps) {
            const cx = ox + bx,
              cy = oy + by
            for (let dy = -r - 1; dy <= r + 1; dy++)
              for (let dx = -r - 1; dx <= r + 1; dx++) {
                if (!inDisk(dx, dy, r)) continue
                const x = cx + dx,
                  y = cy + dy
                if (y > oy) continue
                const d = (dx * 0.55 + dy * 0.83) / r
                let tone = d < 0.08 ? 'light' : d < 0.52 ? 'mid' : 'shade'
                if (tone === 'shade' && (((x - y) % 4) + 4) % 4 === 0)
                  tone = 'hatch'
                m.set(x + ',' + y, tone)
              }
            for (let a = 0.15; a < 1.9; a += 0.06) {
              const x = Math.round(cx + Math.cos(a) * (r + 0.3)),
                y = Math.round(cy + Math.sin(a) * (r + 0.3))
              if (y <= oy && m.has(x + ',' + y)) m.set(x + ',' + y, 'hatch')
            }
          }
          for (const k of m.keys()) {
            const [x, y] = k.split(',').map(Number)
            for (const [ax, ay] of [
              [1, 0],
              [-1, 0],
              [0, 1],
              [0, -1],
            ])
              if (!m.has(x + ax + ',' + (y + ay)))
                px(c, x + ax, y + ay, pal.out)
          }
          for (const [k, tone] of m) {
            const [x, y] = k.split(',').map(Number)
            px(c, x, y, pal[tone])
          }
          for (const [qx, qy, qr] of sh.curls)
            for (let a = 0; a < 5.2; a += 0.12) {
              const rr = qr * (1 - a / 6.4)
              px(
                c,
                ox + qx + Math.cos(a + 2.6) * rr,
                oy + qy + Math.sin(a + 2.6) * rr,
                pal.curl,
              )
            }
          return (cloudCache[key] = { cv, ox, oy })
        }
        /* x: середина облака, y: его плоское основание */
        function stampCloud(c, i, palKey, x, y) {
          const s = cloudSprite(i, palKey)
          c.drawImage(s.cv, Math.round(x) - s.ox, Math.round(y) - s.oy)
        }
        function cloudScene(c, palKey, t) {
          const W = c.canvas.width,
            H = c.canvas.height,
            pal = CLOUD_PAL[palKey],
            kx = W / 180,
            ky = H / 72
          pal.sky.forEach((colr, i) => {
            const y0 = Math.round((H * i) / pal.sky.length)
            px(c, 0, y0, colr, W, H - y0)
            if (i > 0)
              for (let x = 0; x < W; x += 4)
                px(c, x + (i & 1 ? 2 : 0), y0 - 1, colr, 2, 1)
          })
          if (pal.star)
            [
              [12, 8],
              [48, 14],
              [84, 6],
              [101, 22],
              [140, 10],
              [168, 18],
              [70, 30],
            ].forEach(([x, y], i) => {
              px(c, x * kx, y * ky, pal.star)
              if (i % 3 === 0) {
                px(c, x * kx - 1, y * ky, pal.star, 3, 1)
                px(c, x * kx, y * ky - 1, pal.star, 1, 3)
              }
            })
          ;[
            [34, 58, 1.0],
            [116, 44, 1.6],
            [160, 66, 0.7],
          ].forEach(([x, base, v], i) =>
            stampCloud(
              c,
              i,
              palKey,
              ((x * kx + t * 3 * v + 40) % (W + 80)) - 40,
              base * ky,
            ),
          )
        }
        /* три времени неба: день, закат, ночь. 'clouds' берёт день или ночь по теме страницы */
        EXTRA.clouds = (c, t) =>
          cloudScene(c, root.dataset.theme === 'night' ? 'night' : 'day', t)
        EXTRA['clouds-day'] = (c, t) => cloudScene(c, 'day', t)
        EXTRA['clouds-sunset'] = (c, t) => cloudScene(c, 'sunset', t)
        EXTRA['clouds-night'] = (c, t) => cloudScene(c, 'night', t)

        /* ---------- общий цикл спрайтов ---------- */
        const sprites = []
        const io = new IntersectionObserver(
          (es) =>
            es.forEach((e) => {
              const s = sprites.find((o) => o.cv === e.target)
              if (s) s.vis = e.isIntersecting
            }),
          { rootMargin: '80px' },
        )
        function addSprite(cv, draw, fps) {
          const o = {
            cv,
            ctx: cv.getContext('2d'),
            draw,
            fps,
            last: -1,
            vis: false,
          }
          o.ctx.imageSmoothingEnabled = false
          sprites.push(o)
          io.observe(cv)
          draw(o.ctx, 0.4)
          return o
        }
        const FPS = {
          flame: 12,
          loader: 16,
          pearl: 12,
          clouds: 3,
          'clouds-day': 3,
          'clouds-sunset': 3,
          'clouds-night': 3,
        }
        function mount(cv, name, opt = {}) {
          if (sprites.some((o) => o.cv === cv)) return
          if (EXTRA[name]) return addSprite(cv, EXTRA[name], FPS[name] || 10)
          throw new Error('Нет спрайта ' + name)
        }

        /* ---------- небо первого экрана ---------- */
        let heroEl = null,
          sky = null,
          mid = null,
          fly = null,
          heroVis = true
        function rng(a) {
          return () => {
            a |= 0
            a = (a + 0x6d2b79f5) | 0
            let t = Math.imul(a ^ (a >>> 15), 1 | a)
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296
          }
        }
        /* время неба идёт по теме страницы: закат в дневной теме, ночь в ночной. Решение Сергея 23.11.2026.
   data-sky="day|sunset|night" на блоке ставит небо вручную; голубое дневное небо само не показывается */
        function skyTime() {
          const v = heroEl.dataset.sky
          return v === 'day' || v === 'sunset' || v === 'night'
            ? v
            : root.dataset.theme === 'night'
              ? 'night'
              : 'sunset'
        }
        function renderSky() {
          const W = sky.width,
            H = sky.height,
            c = sky.getContext('2d'),
            time = skyTime(),
            night = time === 'night'
          hero.time = time
          heroEl.dataset.skyNow =
            time /* по data-sky-now стили красят текст шапки */
          const sunset = time === 'sunset'
          const bands = (
            night
              ? [
                  '#1B1838',
                  '#262150',
                  '#382D69',
                  '#57407F',
                  '#86548C',
                  '#C4768D',
                  '#EEA389',
                ]
              : sunset
                ? [
                    '#FFCB52',
                    '#FFD86A',
                    '#FFE083',
                    '#FFE9A6',
                    '#FFDCC0',
                    '#FBC0B0',
                    '#F4A29C',
                  ]
                : [
                    '#86C9EA',
                    '#9BD4EE',
                    '#B7E1F0',
                    '#D9EEE8',
                    '#FFEDCF',
                    '#FFDBB8',
                    '#FFC7A1',
                  ]
          ).map(hex)
          const bay = [
              [0, 8, 2, 10],
              [12, 4, 14, 6],
              [3, 11, 1, 9],
              [15, 7, 13, 5],
            ],
            img = c.createImageData(W, H),
            d = img.data
          for (let y = 0; y < H; y++) {
            const v = (y / (H - 1)) * (bands.length - 1),
              i = Math.min(Math.floor(v), bands.length - 2),
              f = Math.min(1, Math.max(0, (v - i - 0.3) / 0.4))
            for (let x = 0; x < W; x++) {
              const b = bands[f > (bay[y & 3][x & 3] + 0.5) / 16 ? i + 1 : i],
                o = (y * W + x) * 4
              d[o] = b[0]
              d[o + 1] = b[1]
              d[o + 2] = b[2]
              d[o + 3] = 255
            }
          }
          c.putImageData(img, 0, 0)
          const r = rng(7)
          if (night) {
            for (let k = 0; k < Math.round((W * H) / 700); k++) {
              const x = Math.floor(r() * W),
                y = Math.floor(r() * H * 0.7)
              px(c, x, y, r() > 0.7 ? '#FFE9A6' : '#F4EEFF')
              if (r() > 0.86) {
                px(c, x - 1, y, '#F4EEFF', 3, 1)
                px(c, x, y - 1, '#F4EEFF', 1, 3)
              }
            }
          }
          const sx = Math.round(W * 0.84),
            sy = Math.round(H * 0.25)
          if (night) {
            disk(c, sx, sy, 18, 'rgba(244,238,255,.14)')
            disk(c, sx, sy, 12, '#F6EEDC')
            disk(c, sx - 4, sy - 3, 2.8, '#DCD3EA')
            disk(c, sx + 4, sy + 4, 2, '#DCD3EA')
            disk(c, sx + 3, sy - 6, 1.2, '#DCD3EA')
          } else {
            disk(c, sx, sy, 19, 'rgba(255,246,214,.5)')
            disk(c, sx, sy, 12, '#FFEFB0')
            disk(c, sx - 3, sy - 3, 7, '#FFF8D6')
          }
          /* ---- полянка: три гряды холмов, роща, цветы, пруд с камышом, тропинка, домик проката с трубой, забор и флажок ---- */
          const hillFn = (amp, base, ph) => (x) =>
            Math.round(
              (base +
                Math.sin(x * 0.034 + ph) * amp +
                Math.sin(x * 0.011 + ph * 2) * amp * 1.3) /
                2,
            ) * 2
          const gFar = hillFn(H * 0.03, H * 0.255, 2.6),
            gBack = hillFn(H * 0.035, H * 0.2, 1.2),
            gFront = hillFn(H * 0.025, H * 0.11, 4.1)
          const G = night
            ? {
                far: '#4A4580',
                back: '#3F3A6E',
                front: '#322D5C',
                tuft: '#4B4580',
                leaf: '#3E5F6A',
                pine: '#35506A',
                trunk: '#5E4A66',
                path: '#4D477C',
                water: '#4E5FA8',
                glint: '#C9BCF2',
                wood: '#6A5C80',
                stone: '#5A528C',
                brick: '#8A5A7A',
                smoke: 'rgba(201,188,242,.4)',
                flag: '#C4768D',
                bloom: ['#5A528C', '#6A5CC0', '#8B7BD8'],
              }
            : {
                far: '#D3EABB',
                back: '#BFE0A6',
                front: '#9CCB7C',
                tuft: '#7FB56A',
                leaf: '#6FB07A',
                pine: '#57A070',
                trunk: '#8A5A44',
                path: '#F3E0B8',
                water: '#A3D8EF',
                glint: '#FFFFFF',
                wood: '#8A5A44',
                stone: '#B9AED6',
                brick: '#C4583A',
                smoke: 'rgba(255,250,240,.8)',
                flag: '#F0764A',
                bloom: ['#FFF6E6', '#F8B4C2', '#FFD86A', '#FFF6E6'],
              }
          const fill = (g, colr, tuft) => {
            for (let x = 0; x < W; x++) {
              const h = g(x)
              px(c, x, H - h, colr, 1, h)
              if (tuft && (x * 7 + 53) % 11 === 0)
                px(c, x, H - h + 3 + (x % 3), tuft)
            }
          }
          /* дерево и ёлка: x середина, b земля под стволом, s размер (1 = дерево у домика) */
          const tree = (x, b, s) => {
            const k = (v) => Math.round(v * s)
            px(c, x - 1, b - k(6), s > 0.8 ? 3 : 2, k(6), G.trunk)
            disk(c, x, b - k(12), 7 * s, G.leaf)
            disk(c, x, b - k(19), 5 * s, G.leaf)
          }
          const pine = (x, b, s) => {
            const k = (v) => Math.round(v * s)
            px(c, x, b - k(4), s > 0.8 ? 2 : 1, k(4), G.trunk)
            for (let i = 0; i < 3; i++) {
              const w = k(7 - i * 1.7),
                y = b - k(3 + i * 5)
              poly(
                c,
                [
                  [x - w, y],
                  [x, y - k(8)],
                  [x + w, y],
                ],
                G.pine,
              )
            }
          }
          const hx = Math.round(W * 0.6),
            hy = H - Math.round(H * 0.13),
            r3 = rng(23)
          fill(gFar, G.far)
          for (let i = 0, n = Math.round(W / 64); i < n; i++) {
            const x = Math.round(((i + 0.2 + r3() * 0.6) / n) * W)
            pine(x, H - gFar(x) + 1, 0.5)
          }
          fill(gBack, G.back)
          for (let i = 0, n = Math.round(W / 46); i < n; i++) {
            const x = Math.round(((i + 0.15 + r3() * 0.7) / n) * W),
              s = 0.6 + r3() * 0.3,
              kind = r3() > 0.45 ? tree : pine
            if (Math.abs(x - hx - 8) < 36) continue
            kind(x, H - gBack(x) + 2, s)
          }
          fill(gFront, G.front, G.tuft)
          /* цветы на ближнем лугу */
          for (let i = 0, n = Math.round(W / 2.6); i < n; i++) {
            const x = Math.floor(r3() * W),
              y = H - 1 - Math.floor(r3() * Math.max(1, gFront(x) - 4))
            if (night && i % 3) continue
            /* ночью цветов видно меньше */ px(
              c,
              x,
              y,
              G.bloom[i % G.bloom.length],
            )
            if (i % 5 === 0) px(c, x, y + 1, G.tuft)
          }
          /* пруд с бликом и камышом */
          const pcx = Math.round(W * 0.2),
            prx = Math.round(Math.min(20, W * 0.085)),
            pry = 3,
            pcy = H - Math.max(pry + 2, Math.round(gFront(pcx) * 0.5))
          for (let dy = -pry; dy <= pry; dy++) {
            const half = Math.round(
              prx * Math.sqrt(1 - (dy / (pry + 0.6)) ** 2),
            )
            px(c, pcx - half, pcy + dy, G.water, half * 2 + 1, 1)
          }
          px(
            c,
            pcx - Math.round(prx * 0.5),
            pcy - 1,
            G.glint,
            Math.round(prx * 0.45),
            1,
          )
          px(c, pcx + 2, pcy + 1, G.glint, Math.round(prx * 0.25), 1)
          ;[
            [-prx - 1, 0],
            [-prx + 2, -2],
            [prx, 1],
          ].forEach(([dx, dy]) => {
            px(c, pcx + dx, pcy + dy - 5, G.tuft, 1, 5)
            px(c, pcx + dx, pcy + dy - 7, G.trunk, 1, 2)
          })
          /* тропинка от двери к краю экрана */
          for (let y = hy + 4; y < H; y++) {
            const u = (y - hy - 4) / (H - hy - 4),
              w = 2 + Math.round(u * 5),
              xc = hx + 12 + Math.sin(u * 3.4) * 8 + u * 9
            px(c, Math.round(xc - w / 2), y, G.path, w, 1)
          }
          /* кусты на гребне и камни */
          for (let i = 0, n = Math.max(2, Math.round(W / 90)); i < n; i++) {
            const x = Math.round(((i + 0.2 + r3() * 0.6) / n) * W),
              y = H - gFront(x) + 1
            if (Math.abs(x - hx - 8) < 32) continue
            disk(c, x, y, 3.2, G.tuft)
            disk(c, x + 4, y + 1, 2.4, G.tuft)
            disk(c, x - 3, y + 1, 2, G.tuft)
          }
          for (let i = 0; i < 3; i++) {
            const x = Math.round(W * (0.08 + 0.84 * r3())),
              y = H - 2 - Math.floor(r3() * gFront(x) * 0.6)
            if (Math.abs(x - pcx) < prx + 4) continue
            px(c, x, y, G.stone, 4, 2)
            px(c, x + 1, y - 1, G.stone, 2, 1)
          }
          /* домик проката: дерево и ёлка рядом, труба с дымком, забор и флажок */
          tree(hx - 16, hy + 6, 1)
          pine(hx - 28, hy + 7, 0.85)
          px(c, hx + 13, hy - 21, G.brick, 3, 8)
          disk(c, hx + 15, hy - 25, 1.6, G.smoke)
          disk(c, hx + 18, hy - 30, 2.2, G.smoke)
          disk(c, hx + 22, hy - 36, 2.8, G.smoke)
          px(c, hx - 1, hy - 11, night ? '#4A4378' : '#463A5E', 18, 15)
          px(c, hx, hy - 10, night ? '#5A528C' : '#FFF6E6', 16, 14)
          poly(
            c,
            [
              [hx - 4, hy - 10],
              [hx + 8, hy - 21],
              [hx + 20, hy - 10],
            ],
            night ? '#C4768D' : '#F0764A',
          )
          px(c, hx + 3, hy - 6, night ? '#FFE9A6' : '#A3D8EF', 4, 4)
          px(c, hx + 10, hy - 4, '#8A5A44', 4, 8)
          if (night) disk(c, hx + 5, hy - 4, 6, 'rgba(255,233,166,.25)')
          const fx = hx + 23,
            fl = Math.min(30, W - fx - 10)
          if (fl > 10) {
            px(c, fx, hy + 1, G.wood, fl + 1, 1)
            for (let x = fx; x <= fx + fl; x += 5)
              px(c, x, hy - 2, G.wood, 1, 6)
            px(c, fx + fl, hy - 17, G.wood, 1, 16)
            poly(
              c,
              [
                [fx + fl + 1, hy - 17],
                [fx + fl + 8, hy - 14],
                [fx + fl + 1, hy - 11],
              ],
              G.flag,
            )
          }
          /* птицы днём и на закате, светлячки ночью */
          if (!night)
            [
              [0.33, 0.21],
              [0.37, 0.18],
              [0.29, 0.24],
            ].forEach(([u, v]) => {
              const x = Math.round(W * u),
                y = Math.round(H * v)
              ;[
                [-2, -1],
                [-1, 0],
                [0, 1],
                [1, 0],
                [2, -1],
              ].forEach(([dx, dy]) => px(c, x + dx, y + dy, '#6A5C80'))
            })
          else
            for (let i = 0, n = Math.round(W / 28); i < n; i++) {
              const x = Math.floor(r3() * W),
                y = Math.floor(H * (0.72 + r3() * 0.22))
              if (i % 3 === 0) disk(c, x, y, 2, 'rgba(255,233,166,.18)')
              px(c, x, y, '#FFE9A6')
            }
        }

        /* ---------- дракон в небе ---------- */
        const hero = {
          pts: [],
          hx: 0,
          hy: 0,
          ang: 0,
          face: 1,
          pearl: [0, 0],
          ptr: null,
          clouds: [],
        }
        function sizeHero() {
          if (heroEl.getBoundingClientRect().width < 2) return
          /* блок скрыт: размер не трогаем */ const r =
              heroEl.getBoundingClientRect(),
            P = r.width < 700 ? 2 : 3,
            W = Math.ceil(r.width / P),
            H = Math.ceil(r.height / P)
          for (const cv of [sky, mid, fly]) {
            cv.width = W
            cv.height = H
            cv.style.width = W * P + 'px'
            cv.style.height = H * P + 'px'
          }
          hero.P = P
          hero.W = r.width
          fly.getContext('2d').imageSmoothingEnabled = false
          mid.getContext('2d').imageSmoothingEnabled = false
          renderSky()
          const N = Math.min(150, Math.max(90, Math.round(W / 3.2)))
          hero.sp = 1.3
          hero.orbit = Math.min(36, Math.max(20, Math.round(W * 0.085)))
          hero.dir = 1
          hero.hx = W * 0.55
          hero.hy = H * 0.42
          hero.ang = 0
          hero.pearl = [hero.hx + hero.orbit * 1.9, hero.hy - H * 0.05]
          hero.pts = Array.from({ length: N }, (_, i) => [
            hero.hx - i * hero.sp,
            hero.hy + Math.sin(i * 0.09) * 9,
          ])
          /* облака разбросаны по всей ширине: каждое в своей полосе, со своей высотой, скоростью и покачиванием */
          const r2 = rng(11),
            nC = Math.max(5, Math.round(W / 42))
          hero.rnd = r2
          hero.clouds = Array.from({ length: nC }, (_, i) =>
            cloudLife(
              {
                far: i % 3 === 2,
                x: ((i + 0.1 + r2() * 0.8) / nC) * (W + 100) - 50,
              },
              r2,
              H,
            ),
          ).sort((a, b) => b.far - a.far)
        }
        /* жизнь одного облака. Дальние: мелкие, медленные, идут навстречу. Ближние: крупные, каждое со своей скоростью.
   Высота считается от верха: облако не заходит под пункты шапки и не опускается на холмы */
        function cloudLife(cl, r, H) {
          cl.shape = cl.far ? 3 + Math.floor(r() * 2) : Math.floor(r() * 4)
          const top =
              Math.ceil(76 / hero.P) + cloudSprite(cl.shape, 'day').oy + 3,
            low = H * (cl.far ? 0.52 : 0.68)
          cl.y = top + r() * Math.max(4, low - top)
          cl.v = cl.far ? -(0.7 + r() * 1.6) : 1.4 + r() * r() * 7
          cl.a = 1 + r() * 3
          cl.f = 0.12 + r() * 0.4
          cl.ph = r() * 6.28
          cl.dy = 0
          return cl
        }
        function stepHero(dt, t) {
          const W = fly.width,
            H = fly.height,
            h = hero
          const tx = h.ptr ? h.ptr[0] : W * 0.5 + Math.cos(t * 0.33) * W * 0.36,
            ty = h.ptr ? h.ptr[1] : H * 0.4 + Math.sin(t * 0.71) * H * 0.2
          const ox = h.pearl[0],
            oy = h.pearl[1],
            R = h.orbit,
            wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a))
          h.pearl[0] += (tx - ox) * Math.min(1, dt * 5)
          h.pearl[1] += (ty - oy) * Math.min(1, dt * 5)
          const vp =
            Math.hypot(h.pearl[0] - ox, h.pearl[1] - oy) / Math.max(dt, 0.001)
          const dx = h.pearl[0] - h.hx,
            dy = h.pearl[1] - h.hy,
            d = Math.hypot(dx, dy) || 1,
            toP = Math.atan2(dy, dx)
          /* дракон не налетает на жемчужину. Издалека летит прямо к ней, вблизи уходит на круг радиуса R, внутри круга отворачивает наружу.
     Сторона облёта выбирается на подлёте и держится, пока дракон рядом */
          if (d > R * 2.2) h.dir = wrap(toP - h.ang) < 0 ? 1 : -1
          const k = d >= R * 1.6 ? 0 : d <= R ? 1 : (R * 1.6 - d) / (R * 0.6),
            off = (k * Math.PI) / 2 + (d < R ? (1 - d / R) * 0.9 : 0),
            da = wrap(toP + h.dir * off - h.ang)
          h.ang += Math.max(-2.8 * dt, Math.min(2.8 * dt, da))
          /* скорость держит расстояние: жемчужина остаётся впереди, примерно в двух радиусах */
          const v = Math.min(
            105,
            Math.max(h.ptr ? 40 : 22, vp + (d - R * 1.9) * 1.1),
          )
          h.hx += Math.cos(h.ang) * v * dt
          h.hy += Math.sin(h.ang) * v * dt
          h.pts[0] = [h.hx, h.hy]
          for (let i = 1; i < h.pts.length; i++) {
            const a = h.pts[i - 1],
              b = h.pts[i]
            let ex = b[0] - a[0],
              ey = b[1] - a[1]
            const L = Math.hypot(ex, ey) || 1
            h.pts[i] = [a[0] + (ex / L) * h.sp, a[1] + (ey / L) * h.sp]
          }
          const cx = Math.cos(h.ang)
          if (Math.abs(cx) > 0.3) h.face = cx > 0 ? 1 : -1
          for (const cl of h.clouds) {
            cl.x += cl.v * dt
            cl.dy = Math.round(Math.sin(t * cl.f + cl.ph) * cl.a)
            if (cl.v > 0 && cl.x > W + 50) {
              cl.x = -50
              cloudLife(cl, h.rnd, H)
            } else if (cl.v < 0 && cl.x < -50) {
              cl.x = W + 50
              cloudLife(cl, h.rnd, H)
            }
          }
        }
        function drawHero(t) {
          const c = fly.getContext('2d'),
            m = mid.getContext('2d'),
            W = fly.width,
            H = fly.height,
            h = hero,
            palKey = skyTime(),
            night = palKey === 'night'
          c.clearRect(0, 0, W, H)
          m.clearRect(0, 0, W, H)
          for (const cl of h.clouds)
            stampCloud(m, cl.shape, palKey, cl.x, cl.y + cl.dy)
          const n = h.pts.length,
            P = h.pts.map((p, i) => {
              const a = h.pts[Math.max(i - 1, 0)],
                b = h.pts[Math.min(i + 1, n - 1)]
              let ex = a[0] - b[0],
                ey = a[1] - b[1]
              const L = Math.hypot(ex, ey) || 1,
                w = Math.sin(i * 0.26 - t * 5) * 2 * Math.min(1, i / 14)
              return [p[0] + (ey / L) * w, p[1] - (ex / L) * w]
            })
          drawDragon(c, HERO, P, t, { face: h.face })
          pearlFlaming(c, h.pearl[0], h.pearl[1], 5, Math.floor(t * 12) % 24)
        }
        function heroMount(el) {
          heroEl = el
          sky = el.querySelector('[data-layer="sky"]')
          mid = el.querySelector('[data-layer="mid"]')
          fly = el.querySelector('[data-layer="fly"]')
          heroEl.addEventListener('pointermove', (e) => {
            const r = heroEl.getBoundingClientRect()
            hero.ptr = [
              (e.clientX - r.left) / hero.P,
              (e.clientY - r.top) / hero.P,
            ]
          })
          heroEl.addEventListener('pointerleave', () => (hero.ptr = null))
          sizeHero()
          let rsz
          new ResizeObserver(() => {
            if (Math.abs(heroEl.getBoundingClientRect().width - hero.W) < 1)
              return
            clearTimeout(rsz)
            rsz = setTimeout(() => {
              sizeHero()
              if (fly.width) drawHero(performance.now() / 1000)
            }, 120)
          }).observe(heroEl)
          new IntersectionObserver(
            (es) => (heroVis = es[0].isIntersecting),
          ).observe(heroEl)
          if (fly.width) drawHero(0)
        }
        function refresh() {
          if (heroEl && sky.width) {
            renderSky()
            drawHero(performance.now() / 1000)
          }
          for (const s of sprites) {
            s.last = -1
            s.draw(s.ctx, 0.4)
          }
        }

        if (!reduce) {
          let last = performance.now(),
            acc = 0
          ;(function loop(now) {
            const dt = Math.min(0.1, (now - last) / 1000)
            last = now
            acc += dt
            const t = now / 1000
            if (acc >= 1 / 24) {
              if (heroEl && heroVis && fly.width) {
                stepHero(acc, t)
                drawHero(t)
              }
              acc = 0
            }
            for (const s of sprites) {
              if (!s.vis) continue
              const f = Math.floor(t * s.fps)
              if (f !== s.last) {
                s.last = f
                s.draw(s.ctx, f / s.fps)
              }
            }
            requestAnimationFrame(loop)
          })(last)
        }

        return {
          mount,
          hero: heroMount,
          refresh,
          names: Object.keys(SPEC)
            .filter((k) => k !== 'hero')
            .concat(Object.keys(EXTRA)),
        }
      })()

export const mount = pixelSpritesApi.mount
export const hero = pixelSpritesApi.hero
export const refresh = pixelSpritesApi.refresh
export const SPRITE_NAMES = pixelSpritesApi.names
export default pixelSpritesApi
