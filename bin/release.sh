#!/usr/bin/env bash

git stash save 'Before release'
rm -rf build/
npm run build
npm test
if [ $? == 0 ]; then
    git tag -a v$npm_package_version -m "Version $npm_package_version"
    git push --tags
else
    echo ' >> Release aborted << '
fi
git stash pop
echo ' >> Released << '

