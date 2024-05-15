import React, {useState, useEffect} from "react";

const DnaSequence = ({sequence, limit}) => {
    const [html, setHtml] = useState(null)

    useEffect(()=>{

        if(sequence){
            setHtml(format(sequence, limit))
        }
    }, [sequence, limit])
    const format = (sequence, limit) => {
        if (sequence) {
            let chars = sequence.split('');
            if (limit && limit < chars.length) {
                chars = chars.slice(0, limit);
               // vm.shorten = true;
            } else {
              //  vm.shorten = false;
            }
            var bases = {'a': true, 'c': true, 't': true, 'g': true};

            return chars.reduce(function(acc, cur) {
                acc += bases[cur.toLowerCase()] ? '<span class="' + cur.toLowerCase() + '">' + cur.toUpperCase() + '</span>' : '<span>' + cur.toUpperCase() + '</span>';
                return acc;
            }, '');

        }
    };

    return <div className='sequence' dangerouslySetInnerHTML={{__html: html}} />
}

export default DnaSequence;