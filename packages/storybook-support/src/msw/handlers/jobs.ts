import { http, type HttpHandler } from 'msw';
import { api, collection, json, problem } from '../api';
import { jobList } from '../../fixtures/jobs';

/** A multi-valued filter, whichever way the client serializes it (`ids=a&ids=b`, `ids[]=a`, `ids=a,b`). */
const listParam = (params: URLSearchParams, name: string) =>
  [...params.getAll(name), ...params.getAll(`${name}[]`)].flatMap((value) => value.split(',')).filter(Boolean);

/** Default handlers for the jobs domain (fixtures in ../../fixtures/jobs.ts). */
export const jobsHandlers: HttpHandler[] = [
  // Filtered by `ids`, `name` and `status` like the API.
  http.get(api('/jobs'), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const ids = listParam(params, 'ids');
    const statuses = listParam(params, 'status');
    const name = params.get('name');
    const matching = jobList.filter(
      (job) =>
        (ids.length === 0 || ids.includes(job.id as string)) &&
        (statuses.length === 0 || statuses.includes(job.status as string)) &&
        (!name || job.name === name),
    );
    return collection(matching, request);
  }),
  // The job monitors poll this while a job runs (`JobAlertProvider`).
  http.get(api('/jobs/:jobId'), ({ params }) => {
    const job = jobList.find((j) => j.id === params['jobId']);
    return job ? json(job) : problem(404, 'Job not found');
  }),
];
