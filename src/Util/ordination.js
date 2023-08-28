import Jaccard from "jaccard-index";
import numeric from "numeric"
const jaccard = Jaccard();

export const getDistanceMatrix = (data) => {
    
    let samples = Object.keys(data)
    
    // create a dataframe
    const matrix = [...samples.map(() => new Array(samples.length))];
    
    for(let i =0; i < samples.length; i++){
        const res = matrix[i]
        res[i] = 0; // dist to self always 0
        const sample1 = samples[i]
        for(let j= i+1; j < samples.length; j++){
            const sample2 = samples[j]
            let idx = (jaccard.index(data[sample1], data[sample2]) /* || 0 */)  // * 10000;
            
            res[j] = idx;
            matrix[j][i] = idx;
            
        }
    }
    return {
        matrix,
        samples
    }
}

 /// given a matrix of distances between some points, returns the
/// point coordinates that best approximate the distances using
/// classic multidimensional scaling
export const classicMDS = (distances, dimensions) => {
    dimensions = dimensions || 2;

    // square distances
    var M = numeric.mul(-0.5, numeric.pow(distances, 2));

    // double centre the rows/columns
    function mean(A) { return numeric.div(numeric.add.apply(null, A), A.length); }
    var rowMeans = mean(M),
        colMeans = mean(numeric.transpose(M)),
        totalMean = mean(rowMeans);

    for (var i = 0; i < M.length; ++i) {
        for (var j =0; j < M[0].length; ++j) {
            M[i][j] += totalMean - rowMeans[i] - colMeans[j];
        }
    }

    // take the SVD of the double centred matrix, and return the
    // points from it
    var ret = numeric.svd(M),
        eigenValues = numeric.sqrt(ret.S);
    return ret.U.map(function(row) {
        return numeric.mul(row, eigenValues).splice(0, dimensions);
    });
};


export const getDataForDissimilarityPlot = (data) => {
    const processedData = getDistanceMatrix(data)
    const mds = classicMDS(processedData.matrix);
    const positions = numeric.transpose(mds);
    const plotData = processedData.samples.map((s,i) => { return {Sample: s, x: positions[0][i], y:positions[1][i]}})
    return plotData; 
}