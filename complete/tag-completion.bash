#/usr/bin/env bash

_tag_completion() {

    if [ ${COMP_CWORD} -eq 1 ]; then
        COMPREPLY=($(compgen -W "add list log" -- "${COMP_WORDS[1]}"))
    elif [ ${COMP_CWORD} -eq 2 ] && [ ${COMP_WORDS[1]} = 'add' ]; then
        COMPREPLY=($(compgen -W '$(tag list -c)' -- "${COMP_WORDS[2]}"))
    else 
        return;
    fi
    
}

complete -F _tag_completion tag
