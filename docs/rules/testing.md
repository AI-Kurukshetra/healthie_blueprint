# Testing Rules

## Hackathon Testing Strategy
Full test suites are not practical in a 10-hour hackathon. Focus on:

### Manual Verification (Required per Phase)
Before merging each phase, manually verify:
1. No TypeScript errors: `npm run build` completes without errors
2. Core flows work: navigate through the main user paths
3. Auth works: can sign up, log in, log out, access correct role views
4. Data persists: created items appear in lists after page refresh
5. RLS works: users cannot see other users' data (test with different demo accounts)
6. Mobile works: check key pages at 375px width

### Build Check
Run `npm run build` before every merge to main. This catches:
- TypeScript errors that only surface in production builds
- Missing imports
- Server/client component boundary violations
- Broken dynamic routes

### What NOT to Do
- Don't write unit tests during the hackathon
- Don't set up a testing framework
- Don't spend more than 5 minutes on any single verification — note the issue and move on
- Don't test edge cases that are unlikely during a judge's demo

### Quick RLS Verification
After setting up the database:
1. Log in as the demo patient
2. Try to access a provider's route — should redirect or show empty
3. Verify patient only sees their own appointments
4. Log in as demo provider
5. Verify provider sees their assigned patients' data
6. Log in as admin
7. Verify admin sees all data
