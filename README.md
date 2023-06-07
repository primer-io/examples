

# Vercel Deployment POC

Welcome to the Vercel Deployment Proof of Concept (POC) repository!

This POC was created to demonstrate the feasibility of deploying our Primer's Dashboard and Frontend Assets using Vercel, a battle-tested hosting service capable of handling high-traffic applications.

In this repository, you will find a working model that shows how we can streamline our deployment process. We illustrate how GitHub workflows are triggered once a PR is merged into the main branch and how they correspond to different environments (sandbox and production).

The POC also shows how these workflows create separate issues for release approval and detail all changes ready for release. Once approved, the workflow continues by creating a PR and performing a fast-forward merge to keep our history clean and easily traceable.

## The RFC

The full RFC can be found here:

### [Migrate Dashboard’s Deployment Pipelines](https://www.notion.so/primerio/Migrate-Dashboard-s-Deployment-Pipelines-fe409af5ee044ef5ac38d69102f60bdd?pvs=4)


## Getting Started

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

