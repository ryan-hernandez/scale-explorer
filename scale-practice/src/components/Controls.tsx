import React from 'react';
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    MenuItem,
    Select,
    Slider,
    Typography,
    Stack,
} from '@mui/material';
import { PlayArrow, Stop, VolumeUp as VolumeIcon } from '@mui/icons-material';

interface ControlsProps {
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    bpm: number;
    setBpm: (bpm: number) => void;
    selectedScale: string;
    setSelectedScale: (scale: string) => void;
    playDown: boolean;
    setPlayDown: (playDown: boolean) => void;
    loop: boolean;
    setLoop: (loop: boolean) => void;
    showAllPositions: boolean;
    setShowAllPositions: (show: boolean) => void;
    volume: number;
    setVolume: (volume: number) => void;
}

const SCALES = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'];
const TEMPO_MARKS = [
    { value: 40, label: 'Largo' },
    { value: 76, label: 'Andante' },
    { value: 108, label: 'Moderato' },
    { value: 120, label: 'Allegro' },
    { value: 168, label: 'Presto' },
    { value: 208, label: 'Prestissimo' },
];

const Controls: React.FC<ControlsProps> = ({
    isPlaying,
    setIsPlaying,
    bpm,
    setBpm,
    selectedScale,
    setSelectedScale,
    playDown,
    setPlayDown,
    loop,
    setLoop,
    showAllPositions,
    setShowAllPositions,
    volume,
    setVolume,
}) => {
    return (
        <Box sx={{ p: 3, backgroundColor: '#1e1e1e', borderRadius: 2 }}>
            {/* Main Controls Section */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 4,
                gap: 3,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                pb: 3
            }}>
                <Box>
                    <Button
                        variant="contained"
                        color={isPlaying ? 'error' : 'primary'}
                        startIcon={isPlaying ? <Stop /> : <PlayArrow />}
                        onClick={() => setIsPlaying(!isPlaying)}
                        sx={{
                            px: 3,
                            py: 1,
                            borderRadius: 2,
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}
                    >
                        {isPlaying ? 'Stop' : 'Start'}
                    </Button>
                </Box>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flex: 1
                }}>
                    <Typography variant="subtitle1" sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 500,
                        minWidth: '80px'
                    }}>
                        Scale:
                    </Typography>
                    <Select
                        value={selectedScale}
                        onChange={(e) => setSelectedScale(e.target.value)}
                        size="small"
                        sx={{
                            minWidth: 120,
                            '& .MuiSelect-select': {
                                py: 1
                            }
                        }}
                    >
                        {SCALES.map((scale) => (
                            <MenuItem key={scale} value={scale}>
                                {scale} Major
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Box>

            {/* Settings Section */}
            <Box sx={{ display: 'flex', gap: 6, mb: 4 }}>
                {/* Playback Options */}
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{
                        mb: 2,
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Playback Options
                    </Typography>
                    <Stack spacing={1}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={playDown}
                                    onChange={(e) => setPlayDown(e.target.checked)}
                                    sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                                />
                            }
                            label="Play Down"
                            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={loop}
                                    onChange={(e) => setLoop(e.target.checked)}
                                    sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                                />
                            }
                            label="Loop"
                            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                        />
                    </Stack>
                </Box>

                {/* Display Options */}
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{
                        mb: 2,
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Display Options
                    </Typography>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={showAllPositions}
                                onChange={(e) => setShowAllPositions(e.target.checked)}
                                sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                            />
                        }
                        label="Show All Positions"
                        sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                    />
                </Box>
            </Box>

            {/* Sliders Section */}
            <Stack spacing={4} sx={{ px: 0 }}>
                {/* Tempo Slider */}
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Tempo
                        </Typography>
                        <Typography variant="body2" sx={{
                            ml: 2,
                            color: 'rgba(255, 255, 255, 0.5)'
                        }}>
                            {bpm} BPM
                        </Typography>
                    </Box>
                    <Box sx={{ mx: 1.5 }}>
                        <Slider
                            value={bpm}
                            onChange={(_, value) => setBpm(value as number)}
                            min={40}
                            max={208}
                            marks={TEMPO_MARKS}
                            valueLabelDisplay="auto"
                            sx={{
                                '& .MuiSlider-markLabel': {
                                    fontSize: '0.75rem',
                                    color: 'rgba(255, 255, 255, 0.5)'
                                },
                                '& .MuiSlider-rail': {
                                    opacity: 0.3
                                },
                                mt: 3,
                                mb: 1
                            }}
                        />
                    </Box>
                </Box>

                {/* Volume Slider */}
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <VolumeIcon sx={{
                                fontSize: '1.2rem',
                                color: 'rgba(255, 255, 255, 0.7)'
                            }} />
                            <Typography variant="subtitle2" sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Volume
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{
                            ml: 2,
                            color: 'rgba(255, 255, 255, 0.5)'
                        }}>
                            {Math.round(volume)} dB
                        </Typography>
                    </Box>
                    <Box sx={{ mx: 1.5 }}>
                        <Slider
                            value={volume}
                            onChange={(_, value) => setVolume(value as number)}
                            min={-60}
                            max={0}
                            valueLabelDisplay="auto"
                            sx={{
                                '& .MuiSlider-rail': {
                                    opacity: 0.3
                                }
                            }}
                        />
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
};

export default Controls; 