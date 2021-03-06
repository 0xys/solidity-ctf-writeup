import * as fs from 'fs';
import path from 'path';
const solc = require('solc');

export class SolCompiler  {
    constructor(private version: string, private problemName: string){

    }

    compile = async (input: any): Promise<{success: boolean, output?: any}> => {
        const compiler = await this.loadCompileVersion(this.version);
        const output = JSON.parse(
            compiler.compile(JSON.stringify(input(this.findFileContent)), { import: this.findFileContent })
        );
        if(output.errors.length > 0){
            var error = false;
            output.errors.forEach((e: any) => {
                if(e.severity == 'error'){
                    error = true;
                }
                if(e.errorCode != '1878') console.log(e);
            });
            if(error) return {success: false};
        }

        return {success: true, output};
    }

    private loadCompileVersion = (version: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            solc.loadRemoteVersion(version, (err: any, compiler: any) => {
                if(err) reject(err);
                resolve(compiler);
            })
        });
    }

    private pather = (filepath: string): string => {
        return path.join(__dirname, `../../problems/${this.problemName}/`, filepath)
    }
    
    private findFileContent = (filepath: string): string => {
        return fs.readFileSync(this.pather(filepath)).toString();
    }
}