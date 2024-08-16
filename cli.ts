import { $ } from "bun";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv))
    .command(
        "install",
        "installs packages listed out in workspace.jsonc",
        async () => {
            const workspaceJsonCFile = Bun.file("./workspace.jsonc");
            const contents = (await workspaceJsonCFile.text())
                .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, "$1")
                .trim();
            const workspaceJSONC = JSON.parse(contents);
            const dependencies: Record<string, string> =
                workspaceJSONC["teambit.dependencies/dependency-resolver"]
                    .policy.dependencies;
            const peerDependencies: Record<string, string> =
                workspaceJSONC["teambit.dependencies/dependency-resolver"]
                    .policy.peerDependencies;

            const installString = Object.entries({
                ...dependencies,
                ...peerDependencies,
            })
                .map(([a, b]) => `${a}@${b}`)
                .join(" ");
            console.log("Installing", installString);
            const installProcess = Bun.spawn(["bun", "install", installString]);
            await installProcess.exited;
        }
    )
    .command(
        "list",
        "lists all the components in the workspace from .bitmap",
        async () => {
            const bitmapFile = Bun.file("./.bitmap");
            const contents = (await bitmapFile.text())
                .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, "$1")
                .trim();
            const bitmap = JSON.parse(contents);
            console.log("NAME\t\t|\tDIR");
            console.log(
                Object.entries(bitmap)
                    .map(([name, obj]: any) =>
                        name !== "$schema-version"
                            ? `${name}\t|\t${obj.rootDir}`
                            : ""
                    )
                    .join("\n")
            );
        }
    )
    .command("start", "start the server", async () => {
        console.log("Hasn't been implemented yet");
    })
    .parse();
