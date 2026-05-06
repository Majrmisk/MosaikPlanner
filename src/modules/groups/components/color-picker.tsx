function hueToColor(hue: number): string {
    return `hsl(${hue}, 100%, 50%)`;
}

function colorToHue(color: string): number {
    const match = color.match(/hsl\((\d+)/);
    return match ? parseInt(match[1]!) : 220;
}

export const DEFAULT_COLOR = hueToColor(220);

type ColorPickerProps = {
    value: string;
    onChange: (color: string) => void;
};

export function ColorPicker({ value, onChange }: ColorPickerProps) {
    const hue = colorToHue(value);

    return (
        <div className="flex items-center gap-3">
            <span className="size-6 shrink-0 rounded-full" style={{ backgroundColor: value }} />
            <input
                type="range"
                min={0}
                max={360}
                value={hue}
                onChange={(e) => onChange(hueToColor(Number(e.target.value)))}
                // Slop but it works
                className="h-3 w-full cursor-pointer appearance-none rounded-full [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-black [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black"
                style={{
                    background:
                        'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))',
                }}
            />
        </div>
    );
}
