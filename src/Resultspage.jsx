import React, { useEffect, useState } from 'react';

/*
  -port over styling
  -fix the data filter
*/

function SearchResults({ houses, selectedRange }) {
  const [filteredData, setfilteredData] = useState([]);

  useEffect(() => {
    //filtering data
    const thisFilteredData = houses.map(house => {
      let returnResult;
      if(house.integerPrice >= selectedRange.lowerBound && house.integerPrice < selectedRange.upperBound){
        returnResult = house;
      }
      return(returnResult);
    });
    setfilteredData(thisFilteredData);
  },[houses,selectedRange,setfilteredData])
  return (
      <>
      <div className='container mx-auto'>
        <div className='flex flex-wrap m-auto w-full py-32'>
        {filteredData.map(house => {
          if(house){
            return (
              <div key={house.listing_id} className="rounded border-2 mr-5 mb-5 border-red-600 px-6 py-6 bg-slate-100 w-72 h-72">
                {house.address}
                <br/>
                <img className="w-9/10 h-40" src={house.image} alt={"Image of: " + house.address}/>
                Price: {house.price}
              </div>
            );
          }
        }
        )}
        </div>
      </div>
      </>
  );
}

export default SearchResults;