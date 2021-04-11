# Register AWS ECS Task Definition

Registers a Task Definition in AWS ECS

## Github Action Usage

```yaml
      - name: Register AWS ECS Task Definition
        uses: icalia-actions/register-aws-ecs-task-definition@v0.0.1
        with:
          family: my-task-definition-family
          template: templates/ecs/my-task-definition.yml

          # You can override the image used on any container - the most common
          # use case is to deploy an image built & pushed on a previous step:
          container-images: '{"my-container":"my-built-image"}'

          # You can optionally override any environment variable in the task 
          # container definitions, given that the overridden environment variable
          # already exists in the container definition:
          environment-vars: '{"FOO":"BAR"}'
```

## Library Usage

```
yarn add --dev @icalialabs/register-aws-ecs-task-definition
```