const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');
const os = require('os');

const docker = new Docker(); // cần Docker đang chạy

const fileMap = { python: 'temp_code.py', 'c++': 'main.cpp', java: 'Main.java' };
const imageMap = {
  python: 'python:3.10',
  'c++': 'gcc:12',
  java: 'eclipse-temurin:17',
};
const compileMap = {
  python: null,
  'c++': 'g++ /app/main.cpp -o /app/main',
  java: 'javac /app/Main.java',
};
const runMap = {
  python: 'python /app/temp_code.py',
  'c++': '/app/main',
  java: 'java -cp /app Main',
};

/**
 * Chạy code với 1 hoặc nhiều input
 * @returns {{ output: string, error: string }}
 */
async function runCode(lang, code, inputs = ['']) {
  lang = (lang || 'python').toLowerCase().trim();
  if (!fileMap[lang]) {
    return { output: '', error: 'Ngôn ngữ không hỗ trợ' };
  }

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'practice-'));
  const filename = fileMap[lang];

  try {
    fs.writeFileSync(path.join(workDir, filename), code);

    const container = await docker.createContainer({
      Image: imageMap[lang],
      Cmd: ['sleep', 'infinity'],
      HostConfig: {
        Binds: [`${workDir}:/app`],
        Memory: 256 * 1024 * 1024,
        NetworkMode: 'none',
      },
      Tty: true,
    });

    await container.start();

    if (compileMap[lang]) {
      await container.exec({
        Cmd: ['bash', '-c', compileMap[lang]],
        AttachStdout: true,
        AttachStderr: true,
      }).then((exec) => exec.start({ hijack: true, stdin: false }));
    }

    const results = [];
    for (const inp of inputs.length ? inputs : ['']) {
      const safeInp = String(inp).replace(/'/g, "'\\''");
      const execCmd = `bash -c "echo '${safeInp}' | ${runMap[lang]}"`;

      const exec = await container.exec({
        Cmd: ['bash', '-c', execCmd],
        AttachStdout: true,
        AttachStderr: true,
      });

      const stream = await exec.start({ hijack: true, stdin: false });
      let out = '';
      await new Promise((resolve) => {
        stream.on('data', (chunk) => {
          out += chunk.toString('utf8');
        });
        stream.on('end', resolve);
      });
      results.push(out.trim());
    }

    await container.stop().catch(() => {});
    await container.remove({ force: true }).catch(() => {});

    return { output: results.join('\n'), error: '' };
  } catch (e) {
    return { output: '', error: e.message };
  } finally {
    try {
      fs.rmSync(workDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

module.exports = { runCode };