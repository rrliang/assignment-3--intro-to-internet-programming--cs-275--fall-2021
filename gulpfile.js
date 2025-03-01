const { src, dest, series, watch } = require(`gulp`);
const gulp = require(`gulp`);
const del = require(`del`);
const babel = require(`gulp-babel`);
const htmlCompressor = require(`gulp-htmlmin`);
const htmlValidator = require(`gulp-html`);
const cssLinter = require(`gulp-stylelint`);
const jsLinter = require(`gulp-eslint`);
const jsCompressor = require(`gulp-uglify`);
const cssCompressor = require(`gulp-uglifycss`);
const browserSync = require(`browser-sync`);
const reload = browserSync.reload;
let browserChoice = `default`;

let paths = {
    input: `/**`,
    output: `/**`,
    js: {
        input: `js/*.js`,
        output: `prod/js`,
        temp: `temp/js`
    },
    css: {
        input: `css/*.css`,
        output: `prod/css`
    },
    html: {
        input: `*.html`,
        output: `prod`
    }
};

async function safari () {
    browserChoice = `safari`;
}

async function firefox () {
    browserChoice = `firefox`;
}

async function chrome () {
    browserChoice = `google chrome`;
}

async function opera () {
    browserChoice = `opera`;
}

async function edge () {
    browserChoice = `microsoft-edge`;
}

async function allBrowsers () {
    browserChoice = [
        `safari`,
        `firefox`,
        `google chrome`,
        `opera`,
        `microsoft-edge`
    ];
}

let validateHTML = () => {
    return gulp.src(paths.html.input)
        .pipe(htmlValidator());
};

let compressHTML = () => {
    return src(paths.html.input)
        .pipe(htmlCompressor({collapseWhitespace: true}))
        .pipe(dest(paths.html.output));
};

let compressCSS = () => {
    return src(paths.css.input)
        .pipe(cssCompressor())
        .pipe(dest(paths.css.output));
};

let transpileJSForDev = () => {
    return src(paths.js.input)
        .pipe(babel())
        .pipe(dest(paths.js.temp));
};

let transpileJSForProd = () => {
    return src(paths.js.input)
        .pipe(babel())
        .pipe(jsCompressor())
        .pipe(dest(paths.js.output));
};

let lintCSS = () => {
    return src(paths.css.input)
        .pipe(cssLinter(
            {
                failAfterError: false,
                reporters: [
                    {formatter: `string`, console: true}
                ]
            }
        ));
};

let lintJS = () => {
    return src(paths.js.input)
        .pipe(jsLinter())
        .pipe(jsLinter.formatEach(`compact`));
};

let serve = () => {
    browserSync({
        notify: true,
        port: 9000,
        reloadDelay: 50,
        browser: browserChoice,
        server: {
            baseDir: [
                `css`,
                `./`,
                `js`
            ]
        }
    });

    watch(paths.js.input,
        series(lintJS, transpileJSForDev)
    ).on(`change`, reload);

    watch(paths.css.input,
        series(lintCSS)
    ).on(`change`, reload);

    watch(paths.html.input,
        series(validateHTML)
    ).on(`change`, reload);
};

async function clean() {
    let fs = require(`fs`),
        i,
        foldersToDelete = [`temp`, `prod`];

    for (i = 0; i < foldersToDelete.length; i++) {
        try {
            fs.accessSync(foldersToDelete[i], fs.F_OK);
            process.stdout.write(`\n\tThe ` + foldersToDelete[i] +
                ` directory was found and will be deleted.\n`);
            del(foldersToDelete[i]);
        } catch (e) {
            process.stdout.write(`\n\tThe ` + foldersToDelete[i] +
                ` directory does NOT exist or is NOT accessible.\n`);
        }
    }

    process.stdout.write(`\n`);
}

async function listTasks () {
    let exec = require(`child_process`).exec;

    exec(`gulp --tasks`, function (error, stdout, stderr) {
        if (null !== error) {
            process.stdout.write(`An error was likely generated when invoking ` +
                `the “exec” program in the default task.`);
        }

        if (`` !== stderr) {
            process.stdout.write(`Content has been written to the stderr stream ` +
                `when invoking the “exec” program in the default task.`);
        }

        process.stdout.write(`\n\tThis default task does ` +
            `nothing but generate this message. The ` +
            `available tasks are:\n\n${stdout}`);
    });
}

exports.safari = series(safari, serve);
exports.firefox = series(firefox, serve);
exports.chrome = series(chrome, serve);
exports.opera = series(opera, serve);
exports.edge = series(edge, serve);
exports.safari = series(safari, serve);
exports.allBrowsers = series(allBrowsers, serve);
exports.validateHTML = validateHTML;
exports.compressHTML = compressHTML;
exports.compressCSS = compressCSS;
exports.transpileJSForDev = transpileJSForDev;
exports.transpileJSForProd = transpileJSForProd;
exports.lintJS = lintJS;
exports.lintCSS = lintCSS;
exports.build = series(
    compressCSS,
    compressHTML,
    transpileJSForProd
);
exports.default = series(
    lintJS,
    lintCSS,
    validateHTML,
    transpileJSForDev,
    serve
);
exports.clean = clean;
exports.listTasks = listTasks;
