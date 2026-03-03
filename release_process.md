Once changes are ready, create a release with the following steps:

1. Ensure working tree is clean and expected.
2. Install dependencies:
   - `npm install`
3. Run validation:
   - `npm run lint`
   - `npm run test`
   - `npm run build`
4. (Optional but recommended) generate checksum for build artifacts:
   - `cd web/dist && sha256sum index.html assets/* > ../dist.sha256`
5. Commit release changes:
   - `git commit -m "Release vX.Y.Z"`
6. Tag release:
   - `git tag X.Y.Z`
7. Push commit and tag:
   - `git push`
   - `git push --tags`
8. Create GitHub release from the tag:
   - include release notes;
   - attach checksum file if generated.
9. Deploy static site:
   - `npm run deploy`
