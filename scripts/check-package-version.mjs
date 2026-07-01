import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
}).trim();

const runGit = (args, options = {}) =>
  execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    ...options,
  }).trim();

const changedFiles = new Set(
  [
    runGit(['diff', '--name-only', 'HEAD', '--', 'packages/*']),
    runGit(['ls-files', '--others', '--exclude-standard', '--', 'packages/*']),
  ]
    .filter(Boolean)
    .flatMap((output) => output.split('\n').filter(Boolean)),
);

const packageDirs = new Set();

for (const file of changedFiles) {
  const parts = file.split('/');

  if (parts.length < 3 || parts[0] !== 'packages') {
    continue;
  }

  const packageJsonPath = join(root, parts[0], parts[1], 'package.json');

  if (existsSync(packageJsonPath)) {
    packageDirs.add(dirname(packageJsonPath));
  }
}

const readCurrentVersion = (packageDir) => {
  const packageJsonPath = join(packageDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  return packageJson.version;
};

const readHeadVersion = (packageDir) => {
  const relativePackageJsonPath = `${packageDir.slice(root.length + 1)}/package.json`;

  try {
    const packageJson = JSON.parse(
      runGit(['show', `HEAD:${relativePackageJsonPath}`], {
        stdio: ['ignore', 'pipe', 'ignore'],
      }),
    );

    return packageJson.version;
  } catch {
    return undefined;
  }
};

const failures = [];

for (const packageDir of packageDirs) {
  const currentVersion = readCurrentVersion(packageDir);
  const headVersion = readHeadVersion(packageDir);

  if (headVersion === undefined) {
    continue;
  }

  if (currentVersion === headVersion) {
    failures.push({
      packageDir: packageDir.slice(root.length + 1),
      version: currentVersion,
    });
  }
}

if (failures.length > 0) {
  console.error('Package changes require a package.json version update.');

  for (const failure of failures) {
    console.error(
      `- ${failure.packageDir}: version is still ${failure.version}`,
    );
  }

  process.exit(1);
}
