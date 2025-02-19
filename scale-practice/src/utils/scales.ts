// Define all possible notations for each note
const NOTE_ENHARMONICS = [
    ['C'],
    ['C#', 'Db'],
    ['D'],
    ['D#', 'Eb'],
    ['E'],
    ['F'],
    ['F#', 'Gb'],
    ['G'],
    ['G#', 'Ab'],
    ['A'],
    ['A#', 'Bb'],
    ['B']
];

// For internal calculations, we'll use the first notation (sharp) of each note
const NOTES = NOTE_ENHARMONICS.map(noteGroup => noteGroup[0]);

// Mapping for normalization (both directions)
const NOTE_MAPPING: { [key: string]: string } = {
    'Bb': 'A#',
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    // Add reverse mappings for completeness
    'A#': 'A#',
    'C#': 'C#',
    'D#': 'D#',
    'F#': 'F#',
    'G#': 'G#'
};

const MAJOR_SCALE_PATTERN = [0, 2, 4, 5, 7, 9, 11]; // Whole, Whole, Half, Whole, Whole, Whole, Half

// Helper function to get the display notation for a note
export const getDisplayNotation = (note: string): string => {
    const normalizedNote = NOTE_MAPPING[note] || note;
    const noteIndex = NOTES.indexOf(normalizedNote);
    if (noteIndex === -1) return note; // Return original if not found
    const enharmonics = NOTE_ENHARMONICS[noteIndex];
    return enharmonics.length > 1 ? `${enharmonics[0]}/${enharmonics[1]}` : enharmonics[0];
};

export const calculateMajorScale = (root: string): string[] => {
    // Convert to normalized form for calculations
    const normalizedRoot = NOTE_MAPPING[root] || root;
    const rootIndex = NOTES.indexOf(normalizedRoot);
    if (rootIndex === -1) {
        throw new Error(`Invalid root note: ${root} (normalized: ${normalizedRoot})`);
    }

    return MAJOR_SCALE_PATTERN.map(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        return NOTES[noteIndex];
    });
};

export const calculateNoteAtFret = (openNote: string, fret: number): string => {
    // Convert to normalized form for calculations
    const normalizedNote = NOTE_MAPPING[openNote] || openNote;
    const startIndex = NOTES.indexOf(normalizedNote);
    if (startIndex === -1) {
        throw new Error(`Invalid open note: ${openNote} (normalized: ${normalizedNote})`);
    }

    const noteIndex = (startIndex + fret) % 12;
    return NOTES[noteIndex];
};

export const isNoteInScale = (note: string, scale: string[]): boolean => {
    const normalizedNote = NOTE_MAPPING[note] || note;
    return scale.includes(normalizedNote);
};

// CAGED positions for major scales (fret offsets from root note)
export const CAGED_POSITIONS = {
    C: [
        { rootString: 5, rootFret: 3 }, // C shape
        { rootString: 5, rootFret: 8 }, // A shape
        { rootString: 6, rootFret: 3 }, // G shape
        { rootString: 6, rootFret: 8 }, // E shape
        { rootString: 5, rootFret: 10 }, // D shape
    ],
    // Add other positions as needed
};

export const findScalePositions = (root: string) => {
    // This is a placeholder - we'll implement the actual CAGED position calculations
    return CAGED_POSITIONS.C.map(pos => ({
        ...pos,
        // Adjust fret positions based on the root note
    }));
}; 