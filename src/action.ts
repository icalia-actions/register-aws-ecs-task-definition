import { info, getInput, setOutput } from "@actions/core";
import {
  registerTaskDefinition,
  TaskRegistrationInput,
} from "./task-definition-registration";

export async function run(): Promise<number> {
  const family = getInput("family");

  info(`Registering task definition '${family}'...`);
  const { taskDefinitionArn } = await registerTaskDefinition({
    family,
    template: getInput("template"),
    secrets: JSON.parse(getInput("secrets") || "null"),
    containerImages: JSON.parse(getInput("container-images") || "null"),
    environmentVars: JSON.parse(getInput("environment-vars") || "null"),
  } as TaskRegistrationInput);
  if (!taskDefinitionArn) throw new Error("Task definition failed to register");

  info("Task Definition Registration Details:");
  info(`  Task Definition ARN: ${taskDefinitionArn}`);
  info("");

  setOutput("task-definition-arn", taskDefinitionArn);

  return 0;
}
