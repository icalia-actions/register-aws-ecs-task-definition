import { info, getInput, setOutput, setFailed } from "@actions/core";
import {
  registerTaskDefinition,
  TaskRegistrationInput,
} from "./task-definition-registration";

export async function run(): Promise<number> {
  const taskRegistrationInput = {
    family: getInput("family"),
    templatePath: getInput("template-path"),
    containerImages: JSON.parse(getInput("container-images") || "null"),
    environmentVars: JSON.parse(getInput("environment-vars") || "null"),
  } as TaskRegistrationInput;

  info(`Registering task definition '${taskRegistrationInput.family}'...`);
  const { taskDefinitionArn } = await registerTaskDefinition(
    taskRegistrationInput
  );
  if (!taskDefinitionArn) throw new Error("Task definition failed to register");

  info("Task Definition Registration Details:");
  info(`  Task Definition ARN: ${taskDefinitionArn}`);
  info("");

  setOutput("task-definition-arn", taskDefinitionArn);

  return 0;
}
