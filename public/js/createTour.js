$(document).ready(function(){

    //---------- If match count>0 auto-click start tour button -----------//

    function t_info(){
        var t_id = $('#t_id').val();
        console.log("t_id: "+t_id);
        var data = {
            t_id: t_id
        }

        $.ajax({
            method: 'POST',
            url: '/api/getMatchesCount',
            data: data,
            success: function(d){
                if(d.matchCount>0){

                    $('#startTour').click();
                }

            }
        })



    }
    t_info();

    //------------------ Add Tournaments -------------------------------//

    $('#addToTable').click(function()
    {
      var t_name = $('#t_name').val();
      if(t_name=='')
        $.notify('Tournament Name required!');
    else{
      var data = {
        name: t_name
    }
    $.ajax({
        method: 'GET',
        url: '/api/registerTour',
        success: function(d){
            // if(d==0){
            //     $.notify(
            //         "Tournament name already exists!", "error",
            //         { globalPosition: 'top center', autoHideDelay: 10000}
            //         );
            // }
            //else{
                $.notify(
                    "Tournament created!", "success",
                    { globalPosition: 'top center', autoHideDelay: 10000}
                    );
                $('#TournamentTable').empty();
                d.forEach(function(d){
                    $('#TournamentTable').append("<tr><td><a href='/tournament/"+d.t_id+"/"+d.t_name+"'>"+d.t_name+"</a></td><td>"+d.status+"</td><td>"+d.winner+"</td></tr>");
                })
            //}
        },


    })

    $.ajax({
        method: 'POST',
        url: '/api/registerTour',
        data: data,
        success: function(d){
            if(d==0){
                $.notify(
                    "Tournament name already exists!", "error",
                    { globalPosition: 'top center', autoHideDelay: 10000}
                    );
            }
            else{
                $.notify(
                    "Tournament created!", "success",
                    { globalPosition: 'top center', autoHideDelay: 10000}
                    );
                $('#TournamentTable').empty();
                d.forEach(function(d){
                    $('#TournamentTable').append("<tr><td><a href='/tournament/"+d.t_id+"/"+d.t_name+"'>"+d.t_name+"</a></td><td>"+d.status+"</td><td>"+d.winner+"</td></tr>");
                })
            }
        },
        error: function(d){

            $.notify(
                "Tournament name already exists!", "error",
                { globalPosition: 'top center', autoHideDelay: 10000}
                );
        }

    })
}

});

    //------------------ Add Players -------------------------------//

    $('#addPlayer').click(function()
    {
      var p_name = $('#p_name').val();
      var t_id = $('#t_id').val();
      var wins=0;
      var loses=0;

      if(p_name=='')
        $.notify('Player name required!',"error");
    else{
      var data = {
        name: p_name,
        t_id: t_id
    }

    $.ajax({
        method: 'POST',
        url: '/api/addPlayer',
        data: data,
        success: function(d){
            if(d==0){
                $.notify(
                    "Entered player name already exists in current tournament!", "error",
                    { globalPosition: 'top center', autoHideDelay: 10000}
                    );
            }
            else{
                $.notify(
                    "New Player added!", "success",
                    { globalPosition: 'top center', autoHideDelay: 10000}
                    );
                console.log("d: "+wins);
                console.log("d: "+loses);
                console.log("d.p_name: "+d.p_name);
                $('#playerStatus').empty();
                d.forEach(function(e){
                    $('#playerStatus').append("<tr><td>"+e.p_name+"</td><td>"+wins+"</td><td>"+loses+"</td></tr>")
                })
                $('#playerTable').empty();
                d.forEach(function(d){
                    $('#playerTable').append("<tr><td>"+d.p_name+"</td></tr>")
                })
            }
        },
        error: function(){
            $.notify(
                "Entered player name already exists in current tournament!", "error",
                { globalPosition: 'top center', autoHideDelay: 10000}
                );
        }

    })
}

});

    //------------------------on Click Start Tour button-------------------------------------//

    $('#startTour').click(function()
    {
      var t_id = $('#t_id').val();
      var data = {
        t_id: t_id
    }
    $.ajax({
        type : 'POST',
        url : '/api/countPlayers',
        data:data,
        success : function(data){
            var rounds = Math.log2(data.players);
            if(Number.isInteger(rounds) && rounds >0){
                console.log("here");
                if(Math.log2(data.count)==data.cur_round.cur_round)
                {
                    $('#sure #modal-body').html('');
                    $('#modal-body').append($('<p>Tournament has ended! You can view results...</p>'));
                    $('#myModal').modal('show');
                }else if(Math.log2(data.count)>data.cur_round.cur_round && data.cur_round.cur_round!=null ){
                    $('#sure #modal-body').html('');
                    $('#modal-body').append($('<p>Tournament has begun! Please continue...</p>'));
                    $('#myModal').modal('show');
                }else{
                    $('#sure #modal-body').html('');
                    $('#modal-body').append($('<p>You can begin the tournament.</p>'));
                    $('#myModal').modal('show');
                }

                $('#startTour,#p_name,#addPlayer').prop('disabled',true);
                console.log("play");
                for(var i=1; i<=rounds; i++)
                {
                    var row =   `<tr>
                    <td>`+i+`</td>
                    <td id=`+data.t_id+`status`+i+`>`+data.status[i-1]+`</td>
                    <td><button type="button" id="execute" class="btn " data-id1=`+i+` data-toggle="modal"
                    data-target="#executeRound">Execute</button></td>
                    <td><button type="button" id="roundResult" class="btn " data-id2=`+i+` data-toggle="modal"
                    data-target="#roundStandings">Standings</button></td>
                    </tr>`
                    $('#roundTable').append(row);
                }

                    //disable buttons on click start tournament

                    //disable last executed round button after re-login
                    $('[data-id1='+data.cur_round.cur_round+']').attr('disabled', true);

                    //select next round standing buttons and disable them
                    var next = data.cur_round.cur_round+1;
                    $('[data-id2='+next+']').attr('disabled', true);

                    //disable execute buttons of prev rounds already executed after re-login
                    for(var i=data.cur_round.cur_round-1;i>=1;i--){
                        $('[data-id1='+i+']').attr('disabled', true);
                    }

                    //disable execute & standing buttons of rounds yet to be executed
                    for(var i=data.cur_round.cur_round+2;i<=Math.log2(data.count);i++){
                        $('[data-id1='+i+']').attr('disabled', true);
                        $('[data-id2='+i+']').attr('disabled', true);
                    }

                }
                else{
                    $('#sure .modal-body').html('');
                    $('#sure .modal-body').append($('<p>Number of players should be 2^n</p>'));
                    $('#myModal').modal('show');
                    console.log("Please add 2^n players");


                }
                //console.log("change tour status: ", Math.log2(data.count));
                //console.log("change tour status: ", data.cur_round.cur_round);

                //change tournament status
                if(Math.log2(data.count)==data.cur_round.cur_round){
                    var status1 = `<h3>Status: Completed</h3>`
                    $('.tour_status').html(status1);
                    //alert("-----t_id---- "+t_id);
                    $.ajax({
                        method: 'GET',
                        url: '/winner/'+t_id,
                        success: function(win){
                            console.log("The winner is: "+win.winner.p_name);
                            $.notify(
                                "The winner is: "+ win.winner.p_name, "success",
                                { globalPosition: 'top center', autoHideDelay: 10000}
                                );
                            $('#finalWinner').append(`<h2 style="color: green">Winner:` +win.winner.p_name+`</h2>`);

                        }
                    })

                }else{
                    var status1 = `<h3>Status: In Progress</h3>`
                    $('.tour_status').html(status1);
                }
            }
        });
});

    //-----------------------------on Click execute button for rounds--------------------------//

    $(document).on("click", "#execute", function(event)
    {
      console.log("execute");
      //alert("entered");
      var round = $(this).attr('data-id1');
      var t_id = $('#t_id').val();
      console.log(t_id);
      console.log(round);
      var data = {
        t_id: t_id
    }
    $.ajax({
        method: 'GET',
        url: `/getFixture/${round}/${data.t_id}`,
        success: function(data){
            var pairs = data.pairs;
            console.log("pairs: "+pairs);
            var round = data.round;
            console.log("round: "+round);
            $('#er_body').empty();
            console.log("pairs.length : "+pairs.length);
            for (var i = 0;i < pairs.length ; i+=2)
            {
                var player1 = pairs[i];
                var p1_id  = pairs[i];
                var player2 = pairs[i+1];
                var p2_id  = pairs[i+1];
                var row = `
                <tr>
                <td>`+player1+`</td>
                <td>`+player2+`</td>
                <td>
                <select class="winners">
                <option value=`+p1_id+`/`+p2_id+`/`+round+`>`+player1+`</option>
                <option value=`+p2_id+`/`+p1_id+`/`+round+`>`+player2+`</option>
                </select>
                </td>
                </tr>
                `
                $('#er_body').append(row);
            }

        }
    })
})

    //------------------on Click submit button for round execution--------------------//

    $(document).on("click", "#submitWinner", function(event)
    {
        var result=[];
        $('select.winners').each(function(){
            result.push($(this).val());
        })
        console.log("result: "+result);
        var roundDetails = [];
        result.forEach(function(info)
        {
            roundDetails.push(
            {
                round: info.split('/')[2],
                winner:info.split('/')[0],
                loser:info.split('/')[1]
            })
        })

        var t_id = $('#t_id').val();
        console.log("t_id:::::::::::::::"+t_id);
        var data = {
            roundDetails:roundDetails,
            t_id: t_id
        }
        $.ajax(
        {
            method: 'POST',
            data: data,
            url: `/reportMatch`,
            success: function(data)
            {var t_id = $('#t_id').val();
            console.log("playerStanding t_id::::" +t_id);
            playerStanding(t_id);
                //var status = `<h3>`+data.status+`</h3>`
                //$('.tour_status').html(status);
                $('#'+data.t_id+'status'+data.round).html('Completed');
                console.log("Math.log2(data.count): ",Math.log2(data.count));
                console.log("data.round: ",data.round);

                    //declare final tournament winner
                    if(Math.log2(data.count)==data.round)
                    {
                        //var t_id = $('#t_id').val();
                        //alert("winner t_id: "+data.t_id);
                        console.log("winner t_id: "+data.t_id);
                        $.ajax({
                            method: 'GET',
                            url: '/winner/'+t_id,
                            success: function(win){
                                console.log("The winner is: "+win.winner.p_name);
                                $.notify(
                                    "The winner is: "+ win.winner.p_name, "success",
                                    { globalPosition: 'top center', autoHideDelay: 10000}
                                    );
                                $('#finalWinner').append(`<h2 style="color: green">Winner:` +win.winner.p_name+`</h2>`);
                                $('.tour_status').html(`<h3>Status: Completed</h3>`);
                            }
                        })

                    }

                    var t_id=data.t_id;
                    var info={t_id:t_id};
                    $.ajax(
                    {
                        data:info,
                        method:'POST',
                        url:'/buttonDisable',
                        success: function(data)
                        {
                            console.log(data.count+""+data.cur_round.cur_round)
                            disableButtons(data.count,data.cur_round.cur_round);
                        }
                    })
                }
            })

    })

    //----------on Click standings button for individual rounds------------------------//

    $(document).on("click", "#roundResult", function(event)
    {
      console.log("roundStandings");
      //alert("entered");
      var round = $(this).attr('data-id2');
      var t_id = $('#t_id').val();
      console.log(t_id);
      console.log(round);
      var data = {
        t_id: t_id
    }
    $.ajax({
        method: 'GET',
        url: `/getStandings/${round}/${data.t_id}`,
        success: function(data)
        {
            $('#rs_body').empty();
            data.data.forEach(function(report)
            {
                var row = `
                <tr>
                <td>`+report.player_1+`</td>
                <td>`+report.player_2+`</td>
                <td>`+report.winner+`</td>
                </tr>
                `
                $('#rs_body').append(row);
            })

        }

    })
})

    //---------------------------functions used----------------------------------//

    function playerStanding(t_id){
        var data = {
            t_id: t_id
        }
        console.log("t_id: /////////////////"+t_id);
        $.ajax({
            method: 'POST',
            url: '/showStanding',
            data: data,
            success: function(standing){
                $('#playerStatus').empty();
                standing.forEach(function(data){
                    var row = `<tr><th>`+data.Name+`</th><td>`+data.wins+`</td><td>`+data.loses+`</td><td>`;

                    $('#playerStatus').append(row);
                })
            }
        })
    }

    function disableButtons(count,cur_round){
        if(Math.log2(count)==cur_round){
            $('[data-id1='+cur_round+']').attr('disabled', true);
            $('[data-id2='+cur_round+']').attr('disabled', false);

        }
        else{
            $('[data-id1='+cur_round+']').attr('disabled', true);
            $('[data-id2='+cur_round+']').attr('disabled', false);
            var next = cur_round+1;
            $('[data-id1='+next+']').attr('disabled', false);
        }
    }

    //-------------------------------------------------------------//

});
