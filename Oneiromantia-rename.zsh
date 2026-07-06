#!/usr/bin/env zsh

old_prefix="oneiro"
new_prefix="oneiromantia"

for file in ${old_prefix}_*; do
    [[ -e "$file" ]] || continue

    new_name="${file/#$old_prefix/$new_prefix}"

    printf '%s -> %s\n' "$file" "$new_name"
    mv -- "$file" "$new_name"
done
