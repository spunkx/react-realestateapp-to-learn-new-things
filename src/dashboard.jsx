import axios from "axios";
import React, {useEffect, useState} from 'react';
import { Routes, Route, Outlet, useNavigate } from "react-router-dom";
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Line, ComposedChart, ReferenceLine } from 'recharts';
import SearchResults from './Resultspage';


//https://reactrouter.com/docs/en/v6/getting-started/concepts
/*
To do in no particular order: 
-loading bar
-BUG: check the current location URL on initial render and setRenderSearch to 1
-Remove confusing lowerValue and upperValue for upperBound and lowerBound
-nav bar
-make look good
-calculations on backend
-Remove anti-patterns
-For to maps where applicable
-gaussian fit function
-stat functions for graphs
-Some more graphs: N.D., PDF ... ???
-Search results
-pagination
-sort houses by: price, alpha, suburb
  
*/

const initPriceRange = [
  {
    lowerBound: 0,
    upperBound: 0,
    frequency: 0,
  },
]

//house object
const house =
  {
    listing_id: 0,
    lat: -1,
    lon: -1,
    list_date: '',
    update_date: '',
    sold: 0,
    price: '',
    address: '',
    bedrooms: 0,
    bathrooms: 0,
    car_ports: 0,
    type: '',
    image: '',
    url: '',
    source: '',
  };
const housePrice =
  {
    listing_id: 0,
    lat: -1,
    lon: -1,
    list_date: '',
    update_date: '',
    sold: 0,
    price: '',
    address: '',
    bedrooms: 0,
    bathrooms: 0,
    car_ports: 0,
    type: '',
    image: '',
    url: '',
    source: '',
    integerPrice: 0,
  };

  /*const componentsToRender =
  {
    components:
      [
        {
          component_name: "Dashboard",
          render_status: 1,
        }
      ]
    };*/

//https://recharts.org/en-US/guide/getting-started
function Dashboard() {
  const [houses, setHouses] = useState([house]);
  const [housesNoPrice, setHousesNoPrice] = useState([house]);
  const [housesPrice, setHousesPrice] = useState([housePrice]);
  const [priceRanges, setPriceRanges] = useState([initPriceRange]);
  const [testpriceRanges, settestpriceRanges] = useState([initPriceRange]); //this needs to get removed later
  const [defaultRange, setDefaultRange] = useState({min:'',max:''});
  const [upperValue, setUpperValue] = useState('');
  const [lowerValue, setLowerValue] = useState('');
  const [increments, setIncrements] = useState(0);
  const [renderSearch, setRenderSearch] = useState(0);
  //to render these
  //const [toRender, setRender] = useState(componentsToRender);
  //const [guassianFit, setGuassianFit] = useState([]); later

  let navigate = useNavigate();

  //dynamics rendering?
  /*
  useEffect(() => {
    //look for components to render
    let renderThese = [];
    for(let i = 0; i < toRender.components.length; i++){
      if(toRender.components[i].render_status === 1){
        //components to render
        renderThese.push(toRender.components[i].component_name);
      }
    }
    //render those components
    for(let i = 0; i < renderThese.length; i++){
      React.createElement(
        renderThese[i]
      );
    }
  },[toRender])*/


  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get('https://static.handstek.com/data/realestate.json',
        {
          headers: {
            'Content-Type': 'application/json',
          }

        });
        setHouses(result.data.data);
      }

    fetchData();
  },[]);

    //move to backend later
    useEffect(()=>{
      const initRanges = async () => {
        let priceRangeAcc = [];
  
        //completely ignore anything greater than $1b and anything less than $1000
        //have a range greater than 100mill and less than 10k
      
        let startPrice = 10001;
        let endPrice = 5010001;
        let increments = 100000;

        setDefaultRange({min:String(startPrice),max:String(endPrice)}); //init the starting range
        setUpperValue(String(startPrice));
        setLowerValue(String(endPrice));
        setIncrements(increments);
        
  
        //init first range
        priceRangeAcc.push(
          {
            lowerBound: startPrice,
            upperBound: increments,
            frequency: 0
          });
          //get all ranges
        for(let i = increments; i < endPrice; i=i+increments){
          priceRangeAcc.push({
            lowerBound: i+1,
            upperBound: i+increments,
            frequency: 0
          });
        }
        setPriceRanges(priceRangeAcc);
      }
      initRanges();
    },[]);

  //when houses changes
  //move to backend later
  useEffect(()=>{
    //this function filters houses into a set of usable integers
    const filterHousingData = () => {
      let houseNoPriceAcc = [];
      let housePriceAcc = [];
      let integerPrice = 0.0;
      
      let housesCopy = houses;
  
      for(let i = 0; i < houses.length; i++){
        //pre filter words
        //round 1
        //gi is global case-insensitive
        let createInteger = housesCopy[i].price.replace(/\$|,|-|'|s/gi,""); //bug: user may enter ranges 900,000-990,000 which will successfully convert to an integer
        //round 2
        createInteger = createInteger.replace(/k/gi,"000");
        //anything else
        integerPrice = parseInt(createInteger);
        if(isNaN(integerPrice)){
          houseNoPriceAcc.push({...housesCopy[i]});
        }
        else{
          housePriceAcc.push({...housesCopy[i], integerPrice: integerPrice});
        }
      }
      //split into two arrays
      setHousesNoPrice(houseNoPriceAcc);
      setHousesPrice(housePriceAcc);
    }
      filterHousingData();
  },[houses]);

  //move to backend later
  useEffect(()=>{
    //create a distribution of freqencies
    const getFrequencies = () => {
      let copyPriceRange = [];
      copyPriceRange = priceRanges;

      for(let i = 0; i < copyPriceRange.length; i++){
        let thisHousePriceFreq = 0;
        for(let j = 0; j < housesPrice.length; j++){
          if(housesPrice[j].integerPrice >= copyPriceRange[i].lowerBound && housesPrice[j].integerPrice <= copyPriceRange[i].upperBound){
            thisHousePriceFreq++;
          }
          copyPriceRange[i].frequency = thisHousePriceFreq;
        }
      }
      settestpriceRanges(copyPriceRange);
    }
    if(housesPrice[0]){
      getFrequencies();
    }
  },[housesPrice,priceRanges]);


  //sider function
  function handleSlider(e){
    //check before setting the new value
    if(parseInt(upperValue) > parseInt(lowerValue)){
      setUpperValue(e.target.value);
      setLowerValue(e.target.value);
    }
    else{
      if(e.target.id === "sliderUpper"){
        setUpperValue(e.target.value);
      }
      else{
        setLowerValue(e.target.value);
      }
    }
  }


  //line of best fit
  //s.d. calculation

  //create a pdf

  //use central limit theorem to create a N.D.


  //gaussian fitting
  //https://fabiandablander.com/r/Curve-Fitting-Gaussian.html

  //my custom tooltip
  const CustomTooltip = ({active, payload, label}) => {

    if(active && payload && payload.length){
      //console.log(payload[0].value);
      return (
        <div className="custom-tooltip bg-sky-600 border-sky-100 border-2 text-white">
          <p className="desc">Range and Frequeny</p>
          <p className="label">{`Data Range: ${label} - ${payload[0].payload.upperBound}`}</p>
          <p className="frequency">{`Frequency: ${payload[0].payload.frequency}`}</p>
        </div>
      );
    }
    return null;
  };

  function handleSearch(e){
    //<SearchResults filteredHouses={housesPrice}/>

    navigate('/resultspage');
    setRenderSearch(1);
  }


  function handleCheckbox(e) {
    if(e.target.value){
      console.log("checkbox!");
    }
  }
  return (
    <>
    {renderSearch ?
      <Routes>
        <Route path="resultspage" element={<SearchResults houses={housesPrice} selectedRange={{lowerBound: upperValue, upperBound:lowerValue}} />}/>
      </Routes>
    : <>
      <div className="rounded border-2 border-red-600">
        <h1>Nav bar</h1>
      </div>
      <div className="flex flex-col min-w-min m-auto w-2/3 text-center p-10 space-y-4">
        <div className="flex rounded border-2 border-red-600 flex-wrap">
          <div>
            <ComposedChart
              width={800}
              height={400}
              data={testpriceRanges}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              >
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis padding={{left: 20}} dataKey="lowerBound" type="number" scale="auto" unit="$"/> {/*requires custom labels*/}
                <YAxis/>
                <Tooltip content={<CustomTooltip/>}/>
                {/*overflow X??*/}
                <Bar dataKey="frequency" fill="#8884d8" />
                <ReferenceLine x={upperValue} stroke="red" strokeWidth={3}/>
                <ReferenceLine x={lowerValue} stroke="red" strokeWidth={3}/>
                <Line type="monotone" dataKey="frequency" stroke="#ff7300" />
              </ComposedChart>
            </div>
            <div className="flex flex-row px-20">
              <div className="">
                <label> <div className="text-xl">Select Range</div>
                  <div className="sliders mx-2">
                    {/*implement my own component*/}
                    <input type="range" step={increments} min={defaultRange.min} max={defaultRange.max} value={upperValue} onChange={handleSlider} className="slider" id="sliderUpper"/>
                    <p>Current Value: ${upperValue}</p>
                    <br></br>
                    <input type="range" step={increments} min={defaultRange.min} max={defaultRange.max} value={lowerValue} onChange={handleSlider} className="slider" id="sliderLower"/>
                    <p>Current Value: ${lowerValue}</p>
                  </div>
                </label>
              </div>
              <div className="px-3 py-16">
                <button onClick={handleSearch} className="cursor-pointer text-white border-blue-300 bg-blue-700 hover:bg-blue-800 h-8 w-24 rounded-lg border-2">
                  Search
                </button>
              </div>
              <div className="px-10">         
                <label> Toggle Guassian Fit (not finished)
                  <input className="mx-2" type="checkbox" onChange={handleCheckbox}/>
              </label>
              </div>
            </div>
        </div>
        <div className="h-60 rounded border-2 border-red-600">
          <h1>Other??? I am size 60</h1>
        </div>
      </div>
      </>
      }
      <Outlet/>
    </>
  );
}

export default Dashboard;
