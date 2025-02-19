import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import * as Tone from 'tone';
import { calculateMajorScale, calculateNoteAtFret, isNoteInScale, getDisplayNotation } from '../utils/scales';

interface FretboardProps {
    scale: string;
    isPlaying: boolean;
    volume: number;
}

const STRINGS = ['E', 'A', 'D', 'G', 'B', 'E'].reverse(); // Reversed to have low E at the bottom
const STRING_BASE_OCTAVES = {
    highE: { note: 'E', octave: 4, index: 0 },
    B: { note: 'B', octave: 3, index: 1 },
    G: { note: 'G', octave: 3, index: 2 },
    D: { note: 'D', octave: 3, index: 3 },
    A: { note: 'A', octave: 2, index: 4 },
    lowE: { note: 'E', octave: 2, index: 5 }
};
const FRETS = 12;
const FRET_MARKERS = [3, 5, 7, 9, 12]; // Standard fret marker positions
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']; // Chromatic scale for octave calculations

const Fretboard: React.FC<FretboardProps> = ({ scale, isPlaying, volume }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [audioContextStarted, setAudioContextStarted] = useState(false);

    const sampler = useMemo(() => {
        console.log("Initializing guitar sampler...");

        // Create a sampler with acoustic guitar samples
        const guitarSampler = new Tone.Sampler({
            urls: {
                // Low E string (E2)
                "E2": "guitar_E2_very-long_forte_normal.mp3",

                // A string (A2)
                "A2": "guitar_A2_very-long_forte_normal.mp3",

                // D string (D3)
                "D3": "guitar_D3_very-long_forte_normal.mp3",

                // G string (G3)
                "G3": "guitar_G3_very-long_forte_normal.mp3",

                // B string (B3)
                "B3": "guitar_B3_very-long_forte_normal.mp3",

                // High E string (E4)
                "E4": "guitar_E4_very-long_forte_normal.mp3"
            },
            baseUrl: "/samples/guitar/",
            onload: () => {
                console.log("Guitar samples loaded successfully!");
                setIsLoaded(true);
            },
            onerror: (error) => {
                console.error("Error loading guitar samples:", error);
                // Create a fallback synth if samples fail to load
                const fallbackSynth = new Tone.PolySynth(Tone.Synth, {
                    oscillator: {
                        type: "triangle"
                    },
                    envelope: {
                        attack: 0.005,
                        decay: 0.1,
                        sustain: 0.3,
                        release: 1.2
                    }
                }).toDestination();

                // Add effects to make the fallback synth more guitar-like
                const filter = new Tone.Filter({
                    type: "lowpass",
                    frequency: 2000,
                    Q: 1
                }).toDestination();

                const dist = new Tone.Distortion({
                    distortion: 0.3,
                    wet: 0.1
                }).toDestination();

                fallbackSynth.connect(filter);
                filter.connect(dist);

                setIsLoaded(true);
                return fallbackSynth;
            },
            volume
        }).toDestination();

        // Add natural reverb for space
        const reverb = new Tone.Reverb({
            decay: 1.5,
            wet: 0.15
        }).toDestination();

        guitarSampler.connect(reverb);
        return guitarSampler;
    }, [volume]);

    // Initialize audio context with user interaction
    const initAudio = async () => {
        if (!audioContextStarted) {
            try {
                if (Tone.getContext().state !== "running") {
                    await Tone.getContext().resume();
                }
                console.log("Audio context started successfully");
                setAudioContextStarted(true);
            } catch (error) {
                console.error("Failed to start audio context:", error);
            }
        }
    };

    const handleContainerClick = async () => {
        await initAudio();
    };

    const currentNoteRef = useRef<number>(0);
    const scaleNotes = useMemo(() => calculateMajorScale(scale), [scale]);

    // Get the normalized root note for comparison
    const normalizedRoot = useMemo(() => {
        const normalizedScale = calculateMajorScale(scale);
        return normalizedScale[0]; // The first note is always the root
    }, [scale]);

    // Get the fifth note of the scale using normalized notes
    const fifthNote = useMemo(() => {
        return scaleNotes[4]; // The fifth is always at index 4 in a major scale
    }, [scaleNotes]);

    // Helper function to calculate the actual note number (0-11) and octave
    const calculateNoteAndOctave = (stringNote: string, fretNumber: number, passedStringIndex: number): [string, number] => {
        // Use the passed string index instead of calculating it
        const noteIndex = NOTES.indexOf(stringNote);
        const newNoteIndex = (noteIndex + fretNumber) % 12;

        console.log(`String: ${stringNote}, Index: ${passedStringIndex}, Note: ${NOTES[newNoteIndex]}, Fret: ${fretNumber}`);

        // Initialize base octave with a default value
        let baseOctave = 3; // Default octave
        let isHighE = false;
        let isLowE = false;

        // Set octaves based on the actual string positions
        switch (passedStringIndex) {
            case 0: // High E
                baseOctave = 4;
                isHighE = true;
                console.log('HIGH E string detected at index 0, setting octave to:', baseOctave);
                break;
            case 1: // B string
                baseOctave = 3;
                break;
            case 2: // G string
                baseOctave = 3;
                break;
            case 3: // D string
                baseOctave = 3;
                break;
            case 4: // A string
                baseOctave = 2;
                break;
            case 5: // Low E
                baseOctave = 2;
                isLowE = true;
                console.log('LOW E string detected at index 5, setting octave to:', baseOctave);
                break;
        }

        // Calculate octave transitions
        let resultOctave = baseOctave;
        const noteE = NOTES.indexOf('E');

        if (isHighE) {
            // High E string (E4) specific octave transitions
            if (fretNumber === 12) {
                resultOctave = baseOctave + 1; // E5 at fret 12
            } else if (fretNumber >= 8 && newNoteIndex < noteE) {
                resultOctave = baseOctave + 1; // Notes before E in next octave from fret 8
            }
        } else if (isLowE) {
            // Low E string (E2) specific octave transitions
            if (fretNumber === 12) {
                resultOctave = baseOctave + 1; // E3 at fret 12
            } else if (fretNumber >= 8 && newNoteIndex < noteE) {
                resultOctave = baseOctave + 1; // Notes before E in next octave from fret 8
            }
        } else if (stringNote === 'D') {
            // D string specific octave transitions
            if (fretNumber >= 12) {
                resultOctave = baseOctave + 1; // Full octave up at fret 12
            } else if (fretNumber >= 7 && newNoteIndex <= NOTES.indexOf('C#')) {
                resultOctave = baseOctave + 1; // Notes C# and below transition to next octave from fret 7
            }
        } else if (stringNote === 'G') {
            // G string specific octave transitions
            if (fretNumber >= 12) {
                resultOctave = baseOctave + 1; // Full octave up at fret 12
            } else if (fretNumber >= 5) {
                resultOctave = baseOctave + 1; // All notes from fret 5 onwards should be in the next octave
            }
        } else if (stringNote === 'B') {
            // B string specific octave transitions
            if (fretNumber >= 12) {
                resultOctave = baseOctave + 1; // Full octave up at fret 12
            } else if (fretNumber >= 1) {
                resultOctave = baseOctave + 1; // All notes after open B should be in octave 4
            }
        } else if (stringNote === 'A') {
            // A string special handling
            if (fretNumber >= 12) {
                resultOctave = baseOctave + 1;
            } else if (fretNumber >= 3 && newNoteIndex < NOTES.indexOf('A')) {
                resultOctave = baseOctave + 1;
            }
        }

        const result: [string, number] = [NOTES[newNoteIndex], resultOctave];
        console.log(`Result: ${result[0]}${result[1]} (String: ${stringNote}, Index: ${passedStringIndex}, Base Octave: ${baseOctave})`);
        return result;
    };

    const playNote = async (stringNote: string, stringIndex: number, fret: number) => {
        if (!audioContextStarted) {
            console.log("Initializing audio on first click");
            await initAudio();
        }

        try {
            if (Tone.getContext().state !== "running") {
                await Tone.getContext().resume();
            }

            const [actualNote, octave] = calculateNoteAndOctave(stringNote, fret, stringIndex);
            const timeVariation = Math.random() * 0.01;
            const velocityVariation = 0.5 + Math.random() * 0.3;
            const durationVariation = 1.2 + Math.random() * 0.4;

            console.log(`Playing note: ${actualNote}${octave} (string: ${STRINGS[stringIndex]}, fret: ${fret})`);
            sampler.triggerAttackRelease(
                `${actualNote}${octave}`,
                `${durationVariation}n`,
                Tone.now() + timeVariation,
                velocityVariation
            );
        } catch (error) {
            console.error("Error playing note:", error, stringNote, stringIndex, fret);
        }
    };

    useEffect(() => {
        if (!isPlaying) {
            currentNoteRef.current = 0;
            return;
        }

        const intervalPlayNote = () => {
            const note = scaleNotes[currentNoteRef.current];
            playNote(note, 0, 0);
            currentNoteRef.current = (currentNoteRef.current + 1) % scaleNotes.length;
        };

        const interval = setInterval(intervalPlayNote, 500);
        return () => clearInterval(interval);
    }, [isPlaying, scaleNotes]);

    const renderString = (stringNote: string, stringIndex: number) => {
        const frets = Array.from({ length: FRETS + 1 }, (_, fretIndex) => {
            const [actualNote] = calculateNoteAndOctave(stringNote, fretIndex, stringIndex);
            const displayNote = getDisplayNotation(actualNote);
            const isInScale = isNoteInScale(actualNote, scaleNotes);
            const isRoot = actualNote === normalizedRoot;
            const isFifth = actualNote === fifthNote;
            const showFretMarker = stringIndex === STRINGS.length - 1 && FRET_MARKERS.includes(fretIndex);

            const handleClick = () => {
                playNote(stringNote, stringIndex, fretIndex);
            };

            const getBackgroundColor = () => {
                if (isRoot) return 'rgba(144, 202, 249, 0.45)';
                if (isFifth) return 'rgba(144, 249, 202, 0.45)';
                if (isInScale) return 'rgba(144, 202, 249, 0.16)';
                return 'transparent';
            };

            const getHoverBackground = () => {
                if (isRoot) return 'rgba(144, 202, 249, 0.55)';
                if (isFifth) return 'rgba(144, 249, 202, 0.55)';
                if (isInScale) return 'rgba(144, 202, 249, 0.24)';
                return 'rgba(144, 202, 249, 0.04)';
            };

            return (
                <Box
                    key={`${stringIndex}-${fretIndex}`}
                    className={`fretboard-note ${isInScale ? 'in-scale' : 'out-of-scale'} ${isRoot ? 'root' : ''} ${isFifth ? 'fifth' : ''}`}
                    onClick={handleClick}
                    sx={{
                        width: fretIndex === 0 ? 40 : 60,
                        height: 40,
                        borderRight: fretIndex === 0
                            ? '3px solid rgba(255, 255, 255, 0.9)'
                            : '2px solid rgba(255, 255, 255, 0.6)',
                        boxShadow: fretIndex === 0
                            ? 'none'
                            : '1px 0 1px rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        backgroundColor: getBackgroundColor(),
                        color: isInScale ? '#fff' : 'rgba(255, 255, 255, 0.3)',
                        fontSize: fretIndex === 0 ? '0.875rem' : (displayNote.length > 2 ? '0.75rem' : '0.875rem'),
                        letterSpacing: '0.01em',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                        fontWeight: isRoot || isFifth ? 600 : (isInScale ? 500 : 400),
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: getHoverBackground(),
                            color: '#fff',
                        },
                        '&:active': {
                            transform: 'scale(0.95)',
                        },
                        '&.playing': {
                            backgroundColor: 'rgba(144, 202, 249, 0.24)',
                            color: '#fff',
                            transform: 'scale(1.05)',
                        },
                        '&::after': (isRoot || isFifth) ? {
                            content: '""',
                            position: 'absolute',
                            bottom: '2px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            backgroundColor: isRoot
                                ? 'rgba(144, 202, 249, 0.8)'
                                : 'rgba(144, 249, 202, 0.8)',
                        } : undefined,
                        '&::before': showFretMarker ? {
                            content: '""',
                            position: 'absolute',
                            bottom: -20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: fretIndex === 12 ? '10px' : '6px',
                            height: fretIndex === 12 ? '10px' : '6px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.4)',
                        } : undefined,
                    }}
                >
                    {fretIndex === 0 ? stringNote : displayNote}
                </Box>
            );
        });

        return (
            <Box
                key={stringIndex}
                sx={{
                    display: 'flex',
                    borderBottom: `1px solid rgba(255, 255, 255, ${stringIndex === STRINGS.length - 1 ? '0.8' : '0.4'})`,
                }}
            >
                {frets}
            </Box>
        );
    };

    // Add loading screen
    if (!isLoaded) {
        return (
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    pt: 4,
                    pb: 4,
                    mb: 4,
                    backgroundColor: '#1e1e1e',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Loading guitar samples...
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    (If loading takes too long, a basic synth will be used as fallback)
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper
            elevation={3}
            sx={{
                p: 2,
                pt: 4,
                pb: 4,
                mb: 4,
                backgroundColor: '#1e1e1e',
                overflowX: 'auto',
            }}
            onClick={handleContainerClick}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 'fit-content',
                    position: 'relative',
                    mt: 3.5,
                }}
            >
                {/* Fret number header bar */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -28,
                        left: 40,
                        right: 0,
                        height: 28,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        borderBottom: '2px solid rgba(255, 255, 255, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    {Array.from({ length: FRETS }).map((_, index) => (
                        <Box
                            key={`fret-number-${index + 1}`}
                            sx={{
                                width: 60,
                                textAlign: 'center',
                                fontSize: '0.75rem',
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontWeight: 500,
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                letterSpacing: '0.02em',
                            }}
                        >
                            {index + 1}
                        </Box>
                    ))}
                </Box>
                {STRINGS.map((note, index) => renderString(note, index))}
            </Box>
        </Paper>
    );
};

export default Fretboard; 