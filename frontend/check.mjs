import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

try {
    execSync('npx tsc -b');
    console.log('Success');
} catch (e) {
    writeFileSync('out.txt', e.stdout.toString(), 'utf-8');
    console.log('Failed');
}
