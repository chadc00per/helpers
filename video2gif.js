const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const { log } = require('../logging');

const videoToGif = (input, output, callback, compressionLevel = "1") => {
    try {
        ffmpeg(input)
            .outputOptions([
                '-vf', 'fps=10,scale=320:-1:flags=lanczos,setpts=PTS/1.5',
                '-gifflags', 'transdiff',
                '-y',
                '-compression_level', compressionLevel, // Added compression level for GIF (0-9, where 0 is no compression and 9 is maximum compression)
            ])
            .on('start', (commandLine) => {
                log(`Running Ffmpeg command: ${commandLine}`);
            })
            .on('progress', (progress) => {
                log(`Processing: ${progress.percent}% done`);
            })
            .on('error', (err) => {
                log(`Error: ${err.message}`);
                callback(err);
            })
            .on('end', () => {
                log('Processing finished successfully');
                callback(null, output);
            })
            .save(output);
    } catch (error) {
        log(`Unexpected error: ${error.message}`);
        callback(error);
        throw error;
    }
};

module.exports = { videoToGif };
