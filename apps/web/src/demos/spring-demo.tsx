import { gsap } from 'gsap';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  TensumPlugin,
  createSpring,
  springCharacteristics,
  springPresets,
  springTo,
} from 'tensum';
import type { SpringController, SpringParameters } from 'tensum';

import { Surface } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

gsap.registerPlugin(TensumPlugin);

const sampleCount = 120;
const plotWidth = 560;
const plotHeight = 148;
const plotPadX = 12;
const plotPadY = 20;

function formatRegime(regime: string): string {
  switch (regime) {
    case 'underdamped':
      return 'Underdamped';
    case 'criticallyDamped':
      return 'Critically damped';
    case 'overdamped':
      return 'Overdamped';
    case 'undamped':
      return 'Undamped';
    default:
      return regime;
  }
}

export function SpringDemo() {
  const id = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const puckRef = useRef<HTMLButtonElement>(null);
  const controllerRef = useRef<SpringController | null>(null);
  const sideRef = useRef<'left' | 'right'>('left');

  const initialPreset = useMemo(() => springPresets.snappy(), []);
  const [stiffness, setStiffness] = useState(Math.round(initialPreset.stiffness));
  const [damping, setDamping] = useState(Math.round(initialPreset.damping));
  const [mass, setMass] = useState(Number(initialPreset.mass.toFixed(1)));
  const [velocity, setVelocity] = useState(0);
  const [showVelocity, setShowVelocity] = useState(true);
  const [running, setRunning] = useState(false);
  const [side, setSide] = useState<'left' | 'right'>('left');
  const [progress, setProgress] = useState(1);

  const parameters = useMemo<SpringParameters>(
    () => ({ mass, stiffness, damping }),
    [mass, stiffness, damping],
  );

  const metrics = useMemo(() => {
    const characteristics = springCharacteristics(parameters);
    const spring = createSpring({
      from: 0,
      to: 1,
      velocity: velocity / 400,
      ...parameters,
    });
    const settlingDuration = spring.getSettlingDuration();
    const displayDuration = Math.min(Math.max(settlingDuration, 0.35), 4);

    const points = Array.from({ length: sampleCount + 1 }, (_, index) => {
      const time = (displayDuration * index) / sampleCount;
      const state = spring.stateAt(time);
      return { time, position: state.position, velocity: state.velocity };
    });

    let minPos = 0;
    let maxPos = 1;
    let maxVel = 1;

    for (const point of points) {
      if (point.position < minPos) minPos = point.position;
      if (point.position > maxPos) maxPos = point.position;
      const absVel = Math.abs(point.velocity);
      if (absVel > maxVel) maxVel = absVel;
    }

    const posRange = Math.max(maxPos - minPos, 0.5);
    const innerWidth = plotWidth - plotPadX * 2;
    const innerHeight = plotHeight - plotPadY * 2;

    const toX = (time: number) => plotPadX + (time / displayDuration) * innerWidth;
    const toPosY = (pos: number) =>
      plotPadY + innerHeight - ((pos - minPos) / posRange) * innerHeight;
    const toVelY = (vel: number) =>
      plotPadY + innerHeight / 2 - (vel / (maxVel * 1.15)) * (innerHeight / 2);

    const positionPath = points
      .map(
        (point, index) =>
          `${index === 0 ? 'M' : 'L'}${toX(point.time).toFixed(1)},${toPosY(point.position).toFixed(1)}`,
      )
      .join(' ');

    const velocityPath = points
      .map(
        (point, index) =>
          `${index === 0 ? 'M' : 'L'}${toX(point.time).toFixed(1)},${toVelY(point.velocity).toFixed(1)}`,
      )
      .join(' ');

    const targetY = toPosY(1);
    const zeroVelY = toVelY(0);

    return {
      characteristics,
      settlingDuration,
      displayDuration,
      positionPath,
      velocityPath,
      targetY,
      zeroVelY,
      toX,
      toPosY,
      spring,
    };
  }, [parameters, velocity]);

  const launch = useCallback(
    (nextSide: 'left' | 'right', nextParams: SpringParameters, nextVelocity: number) => {
      const track = trackRef.current;
      const puck = puckRef.current;
      if (!track || !puck) return;

      const travel = Math.max(track.clientWidth - puck.offsetWidth - 16, 0);
      const targetX = nextSide === 'right' ? travel : 0;

      sideRef.current = nextSide;
      setSide(nextSide);
      setRunning(true);
      setProgress(0);

      const springConfig = {
        mass: nextParams.mass,
        stiffness: nextParams.stiffness,
        damping: nextParams.damping,
      };

      const controller = springTo(puck, {
        x: targetX,
        ...(nextVelocity !== 0
          ? { velocity: { x: nextSide === 'right' ? nextVelocity : -nextVelocity } }
          : {}),
        spring: springConfig,
        unsettled: 'stop',
        onUpdate() {
          const total = controller.tween.duration();
          const current = controller.tween.time();
          setProgress(total > 0 ? Math.min(current / total, 1) : 1);
        },
        onComplete() {
          setRunning(false);
          setProgress(1);
        },
      });

      controllerRef.current = controller;
    },
    [],
  );

  useEffect(() => {
    return () => {
      controllerRef.current?.kill();
    };
  }, []);

  const handleToggle = useCallback(() => {
    const nextSide = sideRef.current === 'left' ? 'right' : 'left';
    launch(nextSide, parameters, velocity);
  }, [launch, parameters, velocity]);

  const sliders = [
    {
      key: 'stiffness',
      label: 'Stiffness',
      value: stiffness,
      min: 40,
      max: 500,
      step: 10,
      unit: 'N/m',
      setValue: setStiffness,
      description: 'Higher stiffness pulls toward the target more strongly.',
    },
    {
      key: 'damping',
      label: 'Damping',
      value: damping,
      min: 0,
      max: 60,
      step: 1,
      unit: 'N·s/m',
      setValue: setDamping,
      description: 'Higher damping removes oscillation and velocity sooner.',
    },
    {
      key: 'mass',
      label: 'Mass',
      value: mass,
      min: 0.5,
      max: 5,
      step: 0.1,
      unit: 'kg',
      setValue: (next: number) => setMass(Number(next.toFixed(1))),
      description: 'More mass resists acceleration and slows response.',
    },
    {
      key: 'velocity',
      label: 'Initial velocity',
      value: velocity,
      min: -1200,
      max: 1200,
      step: 50,
      unit: 'px/s',
      setValue: setVelocity,
      description: 'Starting speed injected when the spring fires.',
    },
  ];

  const playheadTime = progress * metrics.displayDuration;
  const playheadState = metrics.spring.stateAt(playheadTime);
  const playheadX = metrics.toX(playheadTime);
  const playheadY = metrics.toPosY(playheadState.position);

  return (
    <figure data-demo="spring" className="relative">
      <Surface>
        <Card className="rounded-none shadow-none!">
          <CardContent>
            <div
              data-demo-stage=""
              className="relative isolate flex h-96 flex-col justify-between pt-8 pb-2"
            >
              <div
                data-demo-status=""
                data-live={running}
                className="group/status pointer-events-none absolute top-0 left-0 z-10 flex items-center gap-2 type-display text-xs text-muted-foreground"
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 scale-75 rounded-full bg-muted-foreground/50 transition duration-150 ease-out group-data-[live=true]/status:scale-100 group-data-[live=true]/status:bg-emerald-500 motion-reduce:transition-none"
                />
                <span className="grid">
                  <span
                    aria-hidden={running}
                    className="col-start-1 row-start-1 whitespace-nowrap transition duration-150 ease-out group-data-[live=true]/status:-translate-y-1 group-data-[live=true]/status:opacity-0 group-data-[live=true]/status:blur-xs motion-reduce:translate-y-0 motion-reduce:blur-none motion-reduce:transition-none"
                  >
                    Settled
                  </span>
                  <span
                    aria-hidden={!running}
                    className="col-start-1 row-start-1 translate-y-1 whitespace-nowrap opacity-0 blur-xs transition duration-150 ease-out group-data-[live=true]/status:translate-y-0 group-data-[live=true]/status:opacity-100 group-data-[live=true]/status:blur-none motion-reduce:translate-y-0 motion-reduce:blur-none motion-reduce:transition-none"
                  >
                    Running
                  </span>
                </span>
              </div>

              <div className="relative flex-1 overflow-hidden">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-1 left-0 z-10 flex items-center gap-3 text-[11px] text-muted-foreground"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-0.5 w-3 rounded-full bg-emerald-500" />
                    Position
                  </span>
                  {showVelocity && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-0.5 w-3 rounded-full bg-blue-500/70" />
                      Velocity
                    </span>
                  )}
                </div>
                <svg
                  viewBox={`0 0 ${plotWidth} ${plotHeight}`}
                  className="h-full w-full overflow-visible"
                  role="img"
                  aria-label="Analytical spring position and velocity trajectory"
                >
                  <line
                    x1={plotPadX}
                    y1={metrics.targetY}
                    x2={plotWidth - plotPadX}
                    y2={metrics.targetY}
                    className="stroke-border"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  {showVelocity && (
                    <>
                      <line
                        x1={plotPadX}
                        y1={metrics.zeroVelY}
                        x2={plotWidth - plotPadX}
                        y2={metrics.zeroVelY}
                        className="stroke-border/60"
                        strokeDasharray="2 4"
                        strokeWidth="1"
                      />
                      <path
                        d={metrics.velocityPath}
                        fill="none"
                        className="stroke-blue-500/60"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}
                  <path
                    d={metrics.positionPath}
                    fill="none"
                    className="stroke-emerald-500"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx={playheadX}
                    cy={playheadY}
                    r="4"
                    className="fill-emerald-500 stroke-card"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              <div
                ref={trackRef}
                className="relative mt-4 flex h-16 items-center rounded-xl border border-dashed bg-background/60 p-2"
              >
                <button
                  ref={puckRef}
                  type="button"
                  onClick={handleToggle}
                  aria-label={side === 'left' ? 'Spring puck to right' : 'Spring puck to left'}
                  className="flex h-12 w-24 cursor-pointer items-center justify-center rounded-lg bg-card font-mono text-xs text-foreground shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {side === 'left' ? '→' : '←'}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="rounded-none">
            <fieldset
              data-demo-controls=""
              className="m-0 grid w-full min-w-0 grid-cols-2 gap-6 border-0 p-0 text-xs"
            >
              <legend className="sr-only">Spring parameters</legend>
              {sliders.map((slider) => (
                <div className="min-w-0" key={slider.key}>
                  <div className="flex min-h-9 justify-between gap-2 sm:min-h-5">
                    <span className="min-w-0" id={`${id}-${slider.key}-label`}>
                      {slider.label}
                    </span>
                    <output className="shrink-0 font-mono font-medium whitespace-nowrap text-foreground">
                      {slider.value} {slider.unit}
                    </output>
                  </div>
                  <Slider
                    className="py-3 [&_[data-slot=slider-thumb]]:after:-inset-3.5"
                    aria-labelledby={`${id}-${slider.key}-label`}
                    aria-describedby={`${id}-${slider.key}-description`}
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={[slider.value]}
                    onValueChange={(values) => slider.setValue(values[0] ?? slider.value)}
                  />
                  <p
                    className="text-xs leading-relaxed text-muted-foreground"
                    id={`${id}-${slider.key}-description`}
                  >
                    {slider.description}
                  </p>
                </div>
              ))}
              <div className="grid min-w-0 content-start gap-1">
                <div className="flex min-h-14 items-center justify-between gap-2 sm:min-h-11">
                  <label
                    className="flex min-h-11 cursor-pointer items-center"
                    htmlFor={`${id}-velocity-curve`}
                  >
                    Show velocity curve
                  </label>
                  <Switch
                    className="after:-inset-y-3"
                    id={`${id}-velocity-curve`}
                    aria-describedby={`${id}-velocity-curve-description`}
                    checked={showVelocity}
                    onCheckedChange={setShowVelocity}
                  />
                </div>
                <p
                  className="text-xs leading-relaxed text-muted-foreground"
                  id={`${id}-velocity-curve-description`}
                >
                  Overlay analytical velocity alongside position.
                </p>
              </div>
              <div className="grid min-w-0 content-start gap-1">
                <div className="flex min-h-14 items-center justify-between gap-1 sm:min-h-11 sm:gap-2">
                  <span id={`${id}-trigger-label`}>Retarget spring</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label="Retarget spring"
                    aria-describedby={`${id}-trigger-description`}
                    onClick={handleToggle}
                  >
                    {running ? 'Interrupt' : 'Trigger'}
                  </Button>
                </div>
                <p
                  className="text-xs leading-relaxed text-muted-foreground"
                  id={`${id}-trigger-description`}
                >
                  Click mid-flight to test velocity-preserving handoff.
                </p>
              </div>
            </fieldset>
          </CardFooter>
        </Card>
      </Surface>
      <figcaption className="pointer-events-none absolute top-4 right-4 z-10 max-w-[calc(100%-6.5rem)] text-right text-xs leading-none text-muted-foreground">
        <output className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
          <span className="font-mono text-foreground">
            {Number.isFinite(metrics.settlingDuration)
              ? `${metrics.settlingDuration.toFixed(2)} s`
              : 'Unsettled'}
          </span>
          <span className="border-l pl-2">
            {formatRegime(metrics.characteristics.regime)}
          </span>
          <span className="hidden border-l pl-2 font-mono sm:inline">
            ζ {metrics.characteristics.dampingRatio.toFixed(2)}
          </span>
        </output>
      </figcaption>
    </figure>
  );
}
